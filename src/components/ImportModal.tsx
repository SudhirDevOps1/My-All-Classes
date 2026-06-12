import React, { useState } from 'react';
import { DayData } from '../types';
import { X, Upload, FileJson } from 'lucide-react';

interface ImportModalProps {
  onClose: () => void;
  onImport: (data: DayData) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const sampleJson: DayData = {
    "app": "FlowTrack",
    "exportedAt": new Date().toISOString(),
    "subjects": [
      {
        "id": "subject_1",
        "name": "Sample Subject",
        "color": "#9C27B0",
        "createdAt": new Date().toISOString()
      }
    ],
    "sessions": [
      {
        "id": "session_1",
        "subjectId": "subject_1",
        "startTime": new Date().toISOString(),
        "endTime": new Date(Date.now() + 3600000).toISOString(),
        "plannedMinutes": 60,
        "actualSeconds": 0,
        "colorTag": "#9C27B0",
        "notes": "Sample study session",
        "tags": ["focus"],
        "status": "planned",
        "createdAt": new Date().toISOString(),
        "updatedAt": new Date().toISOString(),
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      }
    ]
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonInput(content);
        setError(null);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonInput) as DayData;
      
      // Basic validation
      if (!data.app || data.app !== 'FlowTrack') {
        throw new Error('Invalid FlowTrack JSON file');
      }
      if (!Array.isArray(data.subjects)) {
        throw new Error('Missing or invalid subjects array');
      }
      if (!Array.isArray(data.sessions)) {
        throw new Error('Missing or invalid sessions array');
      }

      onImport(data);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
    }
  };

  const loadSample = () => {
    setJsonInput(JSON.stringify(sampleJson, null, 2));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Import Schedule</h2>
              <p className="text-sm text-gray-400">Upload your FlowTrack JSON file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File Upload Area */}
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
              ${dragActive 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-white/20 hover:border-white/40'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileJson className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-white mb-2">Drag & drop your JSON file here</p>
            <p className="text-sm text-gray-400 mb-4">or</p>
            <label className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors">
              <span className="text-white">Browse Files</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          
          {/* JSON Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Or paste JSON directly</label>
              <button
                onClick={loadSample}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Load Sample
              </button>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setError(null);
              }}
              placeholder='{"app": "FlowTrack", "subjects": [...], "sessions": [...]}'
              className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none font-mono text-sm"
            />
          </div>
          
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!jsonInput.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;