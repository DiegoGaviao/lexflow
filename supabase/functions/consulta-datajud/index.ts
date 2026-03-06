const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Movimentacao {
  data: string;
  descricao: string;
  tipo: "despacho" | "sentenca" | "peticao" | "outro";
}

function limpaNumero(cnj: string): string {
  return cnj.replace(/[^\d]/g, "");
}

function detectarTribunal(cnjLimpo: string): { sigla: string; nome: string } {
  // Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
  // Posições no número limpo (20 dígitos):
  // 0-6: número sequencial
  // 7-8: dígito verificador
  // 9-12: ano
  // 13: segmento de justiça (J)
  // 14-15: tribunal (TR)
  // 16-19: origem (OOOO)

  const segmento = cnjLimpo.charAt(13);
  const tribunalNum = cnjLimpo.substring(14, 16);

  if (segmento === "5") {
    // Justiça do Trabalho
    const trtMap: Record<string, string> = {
      "01": "TRT1", "02": "TRT2", "03": "TRT3", "04": "TRT4", "05": "TRT5",
      "06": "TRT6", "07": "TRT7", "08": "TRT8", "09": "TRT9", "10": "TRT10",
      "11": "TRT11", "12": "TRT12", "13": "TRT13", "14": "TRT14", "15": "TRT15",
      "16": "TRT16", "17": "TRT17", "18": "TRT18", "19": "TRT19", "20": "TRT20",
      "21": "TRT21", "22": "TRT22", "23": "TRT23", "24": "TRT24",
    };
    const sigla = trtMap[tribunalNum] || "TRT1";
    return { sigla, nome: `Tribunal Regional do Trabalho ${tribunalNum}ª Região` };
  }

  if (segmento === "4") {
    // Justiça Federal
    const trfMap: Record<string, string> = {
      "01": "TRF1", "02": "TRF2", "03": "TRF3", "04": "TRF4", "05": "TRF5", "06": "TRF6",
    };
    const sigla = trfMap[tribunalNum] || "TRF1";
    return { sigla, nome: `Tribunal Regional Federal da ${tribunalNum}ª Região` };
  }

  if (segmento === "8") {
    // Justiça Estadual
    const tjMap: Record<string, string> = {
      "01": "TJAC", "02": "TJAL", "03": "TJAP", "04": "TJAM", "05": "TJBA",
      "06": "TJCE", "07": "TJDF", "08": "TJES", "09": "TJGO", "10": "TJMA",
      "11": "TJMT", "12": "TJMS", "13": "TJMG", "14": "TJPA", "15": "TJPB",
      "16": "TJPR", "17": "TJPE", "18": "TJPI", "19": "TJRJ", "20": "TJRN",
      "21": "TJRS", "22": "TJRO", "23": "TJRR", "24": "TJSC", "25": "TJSE",
      "26": "TJSP", "27": "TJTO",
    };
    const sigla = tjMap[tribunalNum] || "TJSP";
    return { sigla, nome: `Tribunal de Justiça – ${sigla.replace("TJ", "")}` };
  }

  return { sigla: "TRF1", nome: "Tribunal Regional Federal da 1ª Região" };
}

function endpointPorSigla(sigla: string): string {
  return `https://api-publica.datajud.cnj.jus.br/api_publica_${sigla.toLowerCase()}/_search`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: { numero_cnj: string };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!payload.numero_cnj) {
    return new Response(JSON.stringify({ error: "campo numero_cnj ausente" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const cnjLimpo = limpaNumero(payload.numero_cnj);
  const { sigla, nome: nomeTribunal } = detectarTribunal(cnjLimpo);
  const endpoint = endpointPorSigla(sigla);

  const body = {
    query: { match: { numeroProcesso: cnjLimpo } },
    size: 1,
  };

  try {
    console.log(`Consultando DataJud: ${endpoint} para CNJ ${cnjLimpo}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `APIKey ${Deno.env.get("DATAJUD_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`DataJud error ${resp.status}:`, text);
      return new Response(JSON.stringify({
        error: "O serviço DataJud (CNJ) retornou um erro ou está instável.",
        detalhe: `Status ${resp.status}`,
        origem: sigla
      }), {
        status: resp.status === 401 ? 401 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dataJud = await resp.json();
    const hit = dataJud.hits?.hits?.[0];

    if (!hit) {
      return new Response(JSON.stringify({ error: "Processo não encontrado no DataJud" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const src = hit._source;

    // Extract movimentacoes
    const movs: Movimentacao[] = (src.movimentos || src.movimentacoes || []).map((m: any) => {
      const descricao = m.complementosTabelados?.map((c: any) => c.descricao || c.nome).join(" – ")
        || m.nome || m.descricao || "Movimentação";
      const tipoRaw = (m.nome || m.descricao || "").toLowerCase();
      let tipo: Movimentacao["tipo"] = "outro";
      if (tipoRaw.includes("despacho")) tipo = "despacho";
      else if (tipoRaw.includes("sentença") || tipoRaw.includes("sentenca")) tipo = "sentenca";
      else if (tipoRaw.includes("petição") || tipoRaw.includes("peticao")) tipo = "peticao";

      return {
        data: m.dataHora?.split("T")[0] || m.data || "",
        descricao,
        tipo,
      };
    }).slice(0, 20); // Limit to 20 most recent

    // Extract parties
    const partes = src.partes || src.polos || [];
    let autor = "";
    let reu = "";

    if (Array.isArray(partes)) {
      for (const polo of partes) {
        const pessoas = polo.partes || polo.pessoas || [polo];
        const nomes = pessoas.map((p: any) => p.nome || p.nomeCompleto || "").filter(Boolean).join(", ");
        const tipoPolo = (polo.polo || polo.tipo || "").toUpperCase();
        if (tipoPolo === "AT" || tipoPolo === "ATIVO" || tipoPolo.includes("AUTOR") || tipoPolo.includes("REQUERENTE")) {
          autor = nomes;
        } else if (tipoPolo === "PA" || tipoPolo === "PASSIVO" || tipoPolo.includes("RÉU") || tipoPolo.includes("REU") || tipoPolo.includes("REQUERIDO")) {
          reu = nomes;
        }
      }
    }

    // Extract subject
    const assuntos = src.assuntos || [];
    const assuntoPrincipal = assuntos[0]?.nome || assuntos[0]?.descricao || src.classeProcessual || src.classe?.nome || "Sem assunto";

    // Extract UF from orgaoJulgador
    const uf = src.orgaoJulgador?.codigoMunicipioIBGE?.toString().substring(0, 2) || "";

    // Last movement date
    const ultimaMovData = movs.length > 0 ? movs[0].data : src.dataAjuizamento?.split("T")[0] || "";

    const resultado = {
      numero: payload.numero_cnj,
      tribunal: nomeTribunal,
      tribunal_sigla: sigla,
      assunto: assuntoPrincipal,
      autor,
      reu,
      uf,
      data_ultimo_movimento: ultimaMovData,
      movimentacoes: movs,
      proxima_data_critica: null,
      status: "ativo",
    };

    console.log("Consulta DataJud bem-sucedida:", resultado.numero);

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Erro na consulta DataJud:", e);
    return new Response(JSON.stringify({ error: "Falha ao consultar DataJud", detalhe: (e as Error).message }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
