import React, { useRef, useState } from 'react';
import { X, UploadCloud } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, name: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [sourceName, setSourceName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile, sourceName || selectedFile.name);
      onClose();
      // Reset state
      setSourceName('');
      setSelectedFile(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Data Source</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Connect a new data source by uploading a CSV file</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Source Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Source Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g., Google Maps, Yellow Pages"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Drag & Drop Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              CSV File <span className="text-red-500">*</span>
            </label>
            <div 
              className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'}
                ${selectedFile ? 'bg-green-50 dark:bg-green-900/10 border-green-500' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input 
                ref={inputRef}
                type="file" 
                className="hidden" 
                accept=".csv"
                onChange={handleChange}
              />
              
              {selectedFile ? (
                 <div className="flex flex-col items-center text-green-600 dark:text-green-400">
                    <UploadCloud size={40} className="mb-3" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-xs mt-1 opacity-70">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                 </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Drop your CSV file here
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    or click to browse
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Option */}
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input 
                id="trends" 
                type="radio" 
                checked 
                readOnly
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 bg-gray-100 dark:bg-gray-700 dark:border-gray-600" 
              />
            </div>
            <label htmlFor="trends" className="text-sm text-gray-600 dark:text-gray-400">
              This file contains trends (sector, summary, LinkedIn post)
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedFile}
            className={`px-6 py-2 rounded-full text-white font-medium flex items-center space-x-2 transition-all
              ${selectedFile ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-gray-400 cursor-not-allowed'}
            `}
          >
            <UploadCloud size={18} />
            <span>Upload Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};
