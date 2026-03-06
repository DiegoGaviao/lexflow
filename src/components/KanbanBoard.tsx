import { MoreVertical, Plus, Calendar, Tag } from 'lucide-react';

export interface Task {
    id: string;
    title: string;
    process: string;
    deadline: string;
    responsible: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'doing' | 'done';
}

interface KanbanBoardProps {
    tasks: Task[];
    onMoveTask?: (taskId: string, newStatus: Task['status']) => void;
}

export const KanbanBoard = ({ tasks }: KanbanBoardProps) => {
    const columns = [
        { id: 'todo', title: 'Pendentes', color: 'slate' },
        { id: 'doing', title: 'Em Andamento', color: 'blue' },
        { id: 'done', title: 'Finalizados', color: 'emerald' }
    ] as const;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'medium': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    return (
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
            {columns.map((column) => (
                <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-200">{column.title}</h3>
                            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                                {tasks.filter(t => t.status === column.id).length}
                            </span>
                        </div>
                        <button className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 min-h-[500px] p-2 rounded-2xl bg-slate-900/50 border border-slate-800/50">
                        {tasks.filter(t => t.status === column.id).length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-800 rounded-xl text-slate-600 text-xs italic">
                                Nenhuma tarefa
                            </div>
                        ) : (
                            tasks
                                .filter(t => t.status === column.id)
                                .map((task) => (
                                    <div
                                        key={task.id}
                                        className="group bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            <button className="text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h4 className="font-semibold text-slate-100 mb-1">{task.title}</h4>
                                        <p className="text-xs text-slate-500 font-mono mb-4">{task.process}</p>

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Calendar className="w-3 h-3" />
                                                {task.deadline ? new Date(task.deadline).toLocaleDateString('pt-BR') : 'Sem data'}
                                            </div>
                                            <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-800/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold uppercase">
                                                        {(task.responsible || 'A').charAt(0)}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-medium">{task.responsible || 'Sem resp.'}</span>
                                                </div>
                                                <Tag className="w-3 h-3 text-slate-600" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
