'use client'

import { FileText, Calendar, User, Bell, Settings, Home as HomeIcon, CheckCircle, Upload, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

interface UploadedFile extends File {
  id: string;
  fileTypes: string[];
  dateOfIssue?: string;
  confirmed?: boolean;
}

export default function Home() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isAssociationModalOpen, setIsAssociationModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [pendingAssociations, setPendingAssociations] = useState<string[]>([])

  const medicalDocuments = [
    { name: "COVID-19", status: "No Status", action: "Update", provided: "Jun 2, 2025" },
    { name: "Health Clearance Card", status: "No Status", action: "Update", provided: "Jun 2, 2025" },
    { name: "Hepatitis B Antigen Serology - HBsAg (Test for Infection)", status: "No Status", action: "Update", provided: "Jun 2, 2025" },
    { name: "Hepatitis B Primary Series", status: "No Status", action: "Add", provided: "Jun 2, 2025" },
    { name: "Hepatitis B Second Series", status: "No Status", action: "Update", provided: "Jun 2, 2025" },
    { name: "Hepatitis C", status: "No Status", action: "Update", provided: "Jun 2, 2025" },
    { name: "Human Immunodeficiency Virus (HIV)", status: "No Status", action: "Update", provided: "Jun 2, 2025" },
    { name: "Influenza", status: "No Status", action: "Update", provided: "Jun 2, 2025" },
    { name: "Measles", status: "No Status", action: "Update", provided: "Jun 2, 2025" },
    { name: "MMR Booster", status: "No Status", action: "Update", provided: "Jun 2, 2025" },
    { name: "Mumps", status: "No Status", action: "Update", provided: "Jun 2, 2025" },
    { name: "Polio", status: "No Status", action: "Update", provided: "Jun 2, 2025" },
    { name: "Rabies Primary Series", status: "No Status", action: "Update", provided: "Jun 2, 2025" }
  ]

  const fileTypes = [
    { value: '', label: 'Select requirement' },
    { value: 'type1', label: 'File type 1' },
    { value: 'type2', label: 'File type 2' },
    { value: 'type3', label: 'File type 3' }
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    // Convert selected files to uploaded files with IDs
    const filesWithIds: UploadedFile[] = selectedFiles.map((file, index) => ({
      ...file,
      id: `file-${Date.now()}-${index}`,
      name: file.name || `File ${uploadedFiles.length + index + 1}`,
      fileTypes: [''],
      dateOfIssue: '',
      confirmed: false
    }))
    
    // Append new files to existing ones
    setUploadedFiles(prev => [...prev, ...filesWithIds])
    
    // If this is the first upload, set current index to 0, otherwise keep current position
    if (uploadedFiles.length === 0) {
      setCurrentFileIndex(0)
      setIsAssociationModalOpen(true)
    }
    
    setIsUploadModalOpen(false)
    setSelectedFiles([])
  }

  const handleFileTypeChange = (value: string, index: number = 0) => {
    setUploadedFiles(prev => prev.map((file, fileIndex) => 
      fileIndex === currentFileIndex 
        ? { ...file, fileTypes: file.fileTypes.map((type, typeIndex) => 
            typeIndex === index ? value : type
          )} 
        : file
    ))
  }

  const addFileTypeAssociation = () => {
    setUploadedFiles(prev => prev.map((file, index) => 
      index === currentFileIndex 
        ? { ...file, fileTypes: [...file.fileTypes, ''] } 
        : file
    ))
  }

  const removeFileTypeAssociation = (index: number) => {
    setUploadedFiles(prev => prev.map((file, fileIndex) => 
      fileIndex === currentFileIndex 
        ? { ...file, fileTypes: file.fileTypes.filter((_, typeIndex) => typeIndex !== index) } 
        : file
    ))
  }

  const truncateFileName = (fileName: string | undefined, maxLength: number = 25) => {
    if (!fileName) return 'Unknown File'
    if (fileName.length <= maxLength) return fileName
    return fileName.substring(0, maxLength - 3) + '...'
  }

  const handleDateChange = (value: string) => {
    setUploadedFiles(prev => prev.map((file, index) => 
      index === currentFileIndex ? { ...file, dateOfIssue: value } : file
    ))
  }

  const handleConfirmationChange = (checked: boolean) => {
    setUploadedFiles(prev => prev.map((file, index) => 
      index === currentFileIndex ? { ...file, confirmed: checked } : file
    ))
  }

  const handleSave = () => {
    // Add to pending associations
    setPendingAssociations(prev => [...prev, ...uploadedFiles.map(f => f.id)])
    
    // Close modal and reset state
    setIsAssociationModalOpen(false)
    setUploadedFiles([])
    setCurrentFileIndex(0)
  }

  const handleNext = () => {
    if (currentFileIndex < uploadedFiles.length - 1) {
      setCurrentFileIndex(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(prev => prev - 1)
    }
  }

  const currentFile = uploadedFiles[currentFileIndex]

  // Force light background
  useEffect(() => {
    document.body.style.backgroundColor = '#f9fafb'
    document.documentElement.style.backgroundColor = '#f9fafb'
    document.body.classList.remove('dark')
    document.documentElement.classList.remove('dark')
    // Remove any dark mode classes
    const htmlElement = document.documentElement
    htmlElement.style.setProperty('--background', '#f9fafb')
    htmlElement.style.setProperty('--foreground', '#171717')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-800">Medical Portal</h1>
        </div>
        
        <nav className="mt-6">
          <div className="px-3">
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              <HomeIcon className="w-5 h-5 mr-3" />
              Dashboard
            </a>
            <a href="#" className="flex items-center px-3 py-2 mt-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              <FileText className="w-5 h-5 mr-3" />
              Important Docs
            </a>
            <a href="#" className="flex items-center px-3 py-2 mt-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              <Settings className="w-5 h-5 mr-3" />
              F.A.Q.
            </a>
            <a href="#" className="flex items-center px-3 py-2 mt-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              <Bell className="w-5 h-5 mr-3" />
              Inbox
            </a>
            <a href="#" className="flex items-center px-3 py-2 mt-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              <FileText className="w-5 h-5 mr-3" />
              My Documents
            </a>
            <a href="#" className="flex items-center px-3 py-2 mt-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
              <CheckCircle className="w-5 h-5 mr-3" />
              Compliance
            </a>
            <a href="#" className="flex items-center px-3 py-2 mt-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              <Calendar className="w-5 h-5 mr-3" />
              Scheduler
            </a>
            <a href="#" className="flex items-center px-3 py-2 mt-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              <FileText className="w-5 h-5 mr-3" />
              Service History
            </a>
            <a href="#" className="flex items-center px-3 py-2 mt-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              <User className="w-5 h-5 mr-3" />
              My Account
            </a>
            <a href="#" className="flex items-center px-3 py-2 mt-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              <Bell className="w-5 h-5 mr-3" />
              Announcements
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Pending Associations Banner */}
          {pendingAssociations.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-blue-900">Certifications</h3>
                <div className="flex items-center space-x-2">
                  <button className="bg-gray-700 text-white px-4 py-2 rounded text-sm">
                    Pending Association ({pendingAssociations.length})
                  </button>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-gray-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Upload
                  </button>
                </div>
              </div>
              <div className="mt-4 bg-white rounded border">
                <div className="grid grid-cols-4 gap-4 p-3 bg-gray-200 text-sm font-medium">
                  <div>Name</div>
                  <div>Status</div>
                  <div>Valid Until</div>
                  <div>Actions</div>
                </div>
                {/* Empty rows for now */}
                <div className="p-8 text-center text-gray-500">
                  No certification data available
                </div>
              </div>
            </div>
          )}

          {/* CRC/VSC Section */}
          <div className="mb-8">
            <div className="bg-slate-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
              <h2 className="text-lg font-medium">CRC/VSC</h2>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="text-sm bg-slate-500 hover:bg-slate-400 px-3 py-1 rounded text-white"
              >
                Upload
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-b-lg">
              <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
                <div>NAME</div>
                <div>STATUS</div>
                <div>VALID UNTIL</div>
                <div>ACTIONS</div>
                <div>ADD/INFO</div>
              </div>
              
              <div className="grid grid-cols-5 gap-4 p-4 items-center border-b">
                <div className="text-sm">Criminal Records Check</div>
                <div className="text-sm text-gray-500">No Status</div>
                <div></div>
                <div>
                  <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-1 rounded text-sm">
                    Update
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Data provided:
                  </div>
                  <div>Jun 2, 2025</div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Documents Section */}
          <div>
            <div className="bg-slate-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
              <h2 className="text-lg font-medium">Permit Form / Medical Documents</h2>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="text-sm bg-slate-500 hover:bg-slate-400 px-3 py-1 rounded text-white"
              >
                Upload
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-b-lg">
              <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
                <div>NAME</div>
                <div>STATUS</div>
                <div>VALID UNTIL</div>
                <div>ACTIONS</div>
                <div>ADD/INFO</div>
              </div>
              
              {medicalDocuments.map((doc, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 p-4 items-center border-b last:border-b-0 hover:bg-gray-50">
                  <div className="text-sm">{doc.name}</div>
                  <div className="text-sm text-gray-500">{doc.status}</div>
                  <div></div>
                  <div>
                    <button className={`px-4 py-1 rounded text-sm text-white ${
                      doc.action === 'Add' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-slate-600 hover:bg-slate-700'
                    }`}>
                      {doc.action}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      Data provided:
                    </div>
                    <div>{doc.provided}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Section */}
          <div className="mt-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">• Click the &quot;Submit&quot; button to submit new or updated data</span>
            </div>
          </div>
                </div>
      </div>

      {/* Initial Upload Modal (for dashboard uploads) */}
      {isUploadModalOpen && !isAssociationModalOpen && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Certification Documents</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Drag and drop files here, or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                  browse
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  />
                </label>
              </p>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Files ({selectedFiles.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
              className={`w-full py-2 px-4 rounded font-medium ${
                selectedFiles.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Upload ({selectedFiles.length})
            </button>
          </div>
        </div>
      )}

      {/* Document Association Modal */}
      {isAssociationModalOpen && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center">
                <h3 className="text-2xl font-bold text-gray-900">Associate Documents</h3>
              </div>
              <div className="flex items-center space-x-2 relative">
                <button 
                  onClick={() => {
                    setIsUploadModalOpen(true)
                  }}
                  className="bg-gray-700 text-white px-4 py-2 rounded text-sm"
                >
                  Add Documents
                </button>
                <button 
                  onClick={() => setIsAssociationModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Tooltip Upload Modal */}
                {isUploadModalOpen && (
                  <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Upload Certification Documents</h3>
                        <button 
                          onClick={() => setIsUploadModalOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Drag & Drop Area */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 ${
                          dragActive 
                            ? 'border-blue-400 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or{' '}
                          <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                            browse
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={handleFileSelect}
                              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            />
                          </label>
                        </p>
                      </div>

                      {/* Selected Files */}
                      {selectedFiles.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Selected Files ({selectedFiles.length})
                          </h4>
                          <div className="space-y-2 max-h-24 overflow-y-auto">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                <button
                                  onClick={() => removeFile(index)}
                                  className="text-gray-400 hover:text-red-500 ml-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upload Button */}
                      <button
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0}
                        className={`w-full py-2 px-4 rounded font-medium ${
                          selectedFiles.length > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Upload ({selectedFiles.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* File Tabs */}
            <div className="flex border-b bg-gray-50">
              {uploadedFiles.map((file, index) => (
                <button
                  key={file.id}
                  onClick={() => setCurrentFileIndex(index)}
                  className={`px-4 py-2 text-sm border-r ${
                    index === currentFileIndex
                      ? 'bg-white border-t border-l border-r border-gray-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {truncateFileName(file.name)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setUploadedFiles(prev => prev.filter(f => f.id !== file.id))
                      if (currentFileIndex >= uploadedFiles.length - 1) {
                        setCurrentFileIndex(Math.max(0, uploadedFiles.length - 2))
                      }
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
              {/* Left Side - Form */}
              <div className="w-1/2 p-6 border-r">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select requirement
                  </label>
                  
                  {/* File Type Associations */}
                  {currentFile?.fileTypes.map((fileType, index) => (
                    <div key={index} className="mb-3 flex items-center space-x-2">
                      <select
                        value={fileType}
                        onChange={(e) => handleFileTypeChange(e.target.value, index)}
                        className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                      >
                        {fileTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {index > 0 && (
                        <button
                          onClick={() => removeFileTypeAssociation(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button 
                    onClick={addFileTypeAssociation}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + associate to more than one
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Data Input</h4>
                  <div className="bg-slate-600 text-white p-3 rounded-t text-sm">
                    Please provide the requirement data shown below
                  </div>
                  <div className="border border-gray-300 rounded-b p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Issue
                      </label>
                      <input
                        type="date"
                        value={currentFile?.dateOfIssue || ''}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 mb-2">
                        Note: Please make sure you&apos;ve entered the information correctly in this form
                      </p>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentFile?.confirmed || false}
                          onChange={(e) => handleConfirmationChange(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          I confirm that all information submitted by me are authentic and correct.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Preview */}
              <div className="w-1/2 p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  {currentFile?.name} Preview
                </h4>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Document Preview</p>
                    <p className="text-sm text-gray-400">
                      {currentFile?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <button
                onClick={handleBack}
                disabled={currentFileIndex === 0}
                className={`flex items-center px-4 py-2 rounded ${
                  currentFileIndex === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  Save
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentFileIndex === uploadedFiles.length - 1}
                  className={`flex items-center px-4 py-2 rounded ${
                    currentFileIndex === uploadedFiles.length - 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-800'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
