import React, { useState } from 'react';
import { FolderOpen, FileText, Search, UploadCloud, Tag, Eye, Sparkles } from 'lucide-react';

interface FileRecord {
  id: string;
  name: string;
  type: string;
  size: string;
  category: string;
  summary: string;
  tags: string[];
  uploadedAt: string;
}

export const FileManagerView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeFile, setActiveFile] = useState<FileRecord | null>(null);

  const initialFiles: FileRecord[] = [
    {
      id: 'f-1',
      name: 'Spaced_Repetition_Methodology.pdf',
      type: 'PDF',
      size: '2.4 MB',
      category: 'Academics',
      summary: 'Academic synthesis of Hermann Ebbinghaus forgetting curve, Leitner active recall protocols, and spaced revision scheduling for exam readiness.',
      tags: ['study', 'revision', 'exams'],
      uploadedAt: 'Yesterday',
    },
    {
      id: 'f-2',
      name: 'Barakah_Shop_Supplier_Contacts_2026.docx',
      type: 'DOCX',
      size: '840 KB',
      category: 'Business',
      summary: 'Direct importer agreements and verified honey apiary contacts in the Sundarbans with quality certification metrics.',
      tags: ['barakah_shop', 'suppliers', 'honey'],
      uploadedAt: '3 days ago',
    },
    {
      id: 'f-3',
      name: 'Classical_Arabic_Nahw_CheatSheet.txt',
      type: 'TXT',
      size: '120 KB',
      category: 'Language',
      summary: 'Complete summary of Marfu\'at, Mansubat, and Majrurat with Harakat and grammatical analysis examples.',
      tags: ['arabic', 'grammar', 'nahw'],
      uploadedAt: '1 week ago',
    },
  ];

  const filtered = initialFiles.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-emerald-500" />
            File Manager & Document Archivist (Agent 09)
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            PDF reading, DOCX processing, intelligent summarization, and Supabase cloud document indexing.
          </p>
        </div>

        <button
          onClick={() => alert('File upload simulated: Document indexed to Supabase Storage with automatic Gemini extraction.')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents by name, category, or tags..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {filtered.map((file) => (
          <div
            key={file.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-bold text-xs shrink-0">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{file.name}</h4>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {file.type}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-1">{file.summary}</p>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span>{file.size}</span>
                  <span>•</span>
                  <span>{file.uploadedAt}</span>
                  <span>•</span>
                  <span>{file.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveFile(file)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Summary</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Viewer Modal */}
      {activeFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  AI Document Extraction: {activeFile.name}
                </h3>
              </div>
              <button onClick={() => setActiveFile(null)} className="text-zinc-400 hover:text-zinc-600">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Executive AI Summary
                </span>
                <p className="text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  {activeFile.summary}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Metadata & Indexing Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeFile.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-600 dark:text-zinc-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setActiveFile(null)}
                className="px-4 py-2 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
