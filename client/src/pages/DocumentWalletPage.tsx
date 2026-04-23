import React, { useState, useEffect, useCallback } from 'react';

import { UploadCloud, CheckCircle2, FileText, AlertCircle, RefreshCw, X, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'missing';

interface DocumentRecord {
  document_type: string;
  public_url: string;
  status: DocumentStatus;
  uploaded_at: string;
  file_name?: string;
}

const DOCUMENT_SLOTS = [
  { id: '10th', label: '10th Certificate', description: 'Proof of date of birth and secondary education.' },
  { id: '12th', label: '12th Certificate', description: 'Proof of higher secondary education.' },
  { id: 'aadhar', label: 'Aadhar / Government ID', description: 'Primary identity verification.' },
  { id: 'category', label: 'Category Certificate', description: 'OBC/SC/ST/EWS verification if applicable.' },
  { id: 'domicile', label: 'Domicile Certificate', description: 'State residence proof.' },
];

const DocumentWalletPage: React.FC = () => {
  const [documents, setDocuments] = useState<Record<string, DocumentRecord>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const docMap: Record<string, DocumentRecord> = {};
        data.documents.forEach((d: DocumentRecord) => {
          docMap[d.document_type] = d;
        });
        setDocuments(docMap);
      }
    } catch (error) {
      console.error('Error fetching docs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[], docId: string, customName?: string) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(docId);
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docId);
    if (customName) formData.append('customName', customName);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // Refresh docs
        await fetchDocuments();
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setUploading(null);
    }
  }, []);

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this document?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        await fetchDocuments();
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting file');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Personal Storage
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Document Wallet</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Keep your essential certificates in one secure place. Uploading documents is <span className="font-semibold text-cyan-200">strictly optional</span>, but it saves you from having to search for them every time you apply for a new exam.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 max-w-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-100">Private & Secure</p>
                <p className="mt-1 text-xs text-emerald-200/70">
                  Your files are stored securely in your personal locker, making future exam applications seamless and fast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DOCUMENT_SLOTS.map((slot) => {
          const doc = documents[slot.id];
          return (
            <DocumentCard
              key={slot.id}
              slot={slot}
              record={doc}
              isUploading={uploading === slot.id}
              onDrop={(files: File[]) => onDrop(files, slot.id)}
              onDelete={() => handleDelete(slot.id)}
            />
          );
        })}
      </div>

      <div className="pt-8 border-t border-white/10 mt-12">
        <h2 className="text-xl font-semibold text-white mb-6">Exam Admit Cards</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(documents)
            .filter((doc) => doc.document_type.startsWith('admit_card_'))
            .map((record) => (
              <DocumentCard
                key={record.document_type}
                slot={{ id: record.document_type, label: record.file_name || 'Admit Card', description: 'Exam Admit Card' }}
                record={record}
                isUploading={uploading === record.document_type}
                onDrop={(files: File[]) => onDrop(files, record.document_type)}
                onDelete={() => handleDelete(record.document_type)}
              />
            ))}
          <DocumentCard
            slot={{ id: `admit_card_new`, label: 'Add Admit Card', description: 'Upload a new exam admit card.' }}
            record={null}
            askForName={true}
            isUploading={uploading === 'admit_card_new'}
            onDrop={(files: File[], name?: string) => onDrop(files, `admit_card_${Date.now()}`, name)}
          />
        </div>
      </div>
    </div>
  );
};

const DocumentCard = ({ slot, record, isUploading, onDrop, onDelete, askForName }: any) => {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');

  const handleDrop = (files: File[]) => {
    if (askForName && !record && files.length > 0) {
      setPendingFile(files[0]);
    } else {
      onDrop(files);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  const getStatusConfig = () => {
    if (!record) return { color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-white/10', label: 'Empty Slot', icon: AlertCircle };
    return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', label: 'Stored Securely', icon: CheckCircle2 };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${isDragActive ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.15)]' : 'border-white/10 bg-slate-900/60 hover:bg-slate-900/80 hover:border-white/20'}`}>
      
      {/* Header section with status */}
      <div className="flex items-center justify-between border-b border-white/5 p-5">
        <h3 className="font-medium text-slate-200">{slot.label}</h3>
        <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
          <StatusIcon className="h-3 w-3" />
          {statusConfig.label}
        </div>
      </div>

      <div className="p-5">
        <p className="mb-5 text-xs text-slate-400">{slot.description}</p>
        
        {pendingFile ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <p className="text-sm font-medium text-slate-200">Name this Admit Card</p>
            <input 
              type="text" 
              placeholder="e.g. UPSC Prelims 2024"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => { setPendingFile(null); setCustomName(''); }}
                className="flex-1 rounded-xl bg-slate-800 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => { 
                  onDrop([pendingFile], customName); 
                  setPendingFile(null); 
                  setCustomName(''); 
                }}
                disabled={!customName.trim()}
                className="flex-1 rounded-xl bg-cyan-400 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        ) : record && !isUploading ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-950/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">{record.file_name || 'Ready for Applications'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <a href={record.public_url} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-lg bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-400/20 hover:scale-105 active:scale-95 cursor-pointer">
                    View File
                  </a>
                  <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-400/10 px-3 py-1.5 text-xs font-medium text-rose-400 transition-all hover:bg-rose-400/20 hover:scale-105 active:scale-95 cursor-pointer">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
            
            <div {...getRootProps()} className="cursor-pointer text-center">
              <input {...getInputProps()} />
              <p className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Click or drag to replace file</p>
            </div>
          </div>
        ) : (
          <div 
            {...getRootProps()} 
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
              isDragActive ? 'border-cyan-400 bg-cyan-400/5' : 'border-slate-700 bg-slate-950/50 hover:border-cyan-400/50 hover:bg-white/5'
            }`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <p className="text-xs font-medium text-cyan-400">Uploading...</p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  {isDragActive ? 'Drop file here' : 'Upload File'}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">PDF, JPG, PNG (Max 5MB)</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentWalletPage;
