'use client'

import { FileText, Calendar, User, Bell, Settings, Home as HomeIcon, CheckCircle, Upload, X, Trash2, ChevronLeft, ChevronRight, Shield, Download, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

interface UploadedFile extends File {
  id: string;
  fileTypes: string[];
  dateOfIssue?: string;
  confirmed?: boolean;
}

interface MedicalDocument {
  name: string;
  status: string;
  action: string;
  provided: string;
  hasUpload?: boolean;
  uploadedFiles?: string[];
  uploadCount?: number;
  lastUpdated?: string;
}

export default function Home() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isAssociationModalOpen, setIsAssociationModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [showCloseWarning, setShowCloseWarning] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [preselectedDocumentType, setPreselectedDocumentType] = useState<string | null>(null)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; isVisible: boolean } | null>(null)
  const [scheduledReview, setScheduledReview] = useState<Date | null>(null)

  const [medicalDocuments, setMedicalDocuments] = useState<MedicalDocument[]>([
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
  ])

  // Create file types from medical documents
  const fileTypes = [
    { value: '', label: 'Select requirement' },
    ...medicalDocuments.map(doc => ({
      value: doc.name,
      label: doc.name
    }))
  ]

  // Toast functionality
  const showToast = (message: string) => {
    setToast({ message, isVisible: true })
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, isVisible: false } : null)
      setTimeout(() => setToast(null), 300) // Clear toast after fade out animation
    }, 5000)
  }

  const dismissToast = () => {
    setToast(prev => prev ? { ...prev, isVisible: false } : null)
    setTimeout(() => setToast(null), 300) // Clear toast after fade out animation
  }

  // Calculate overall compliance status
  const getComplianceStatus = () => {
    const documentsWithUploads = medicalDocuments.filter(doc => doc.hasUpload)
    // Include CRC document in compliance calculation (simulated as not uploaded for demo)
    const crcUploaded = false // This would be tracked separately in a real app
    const totalRequiredDocuments = medicalDocuments.length + 1 // +1 for CRC
    const totalUploaded = documentsWithUploads.length + (crcUploaded ? 1 : 0)
    
    if (totalUploaded === 0) {
      return 'No Status'
    } else if (totalUploaded === totalRequiredDocuments) {
      return 'Pass'
    } else {
      return 'Fail'
    }
  }

  // Check if requirements are met for booking
  const areRequirementsMet = () => {
    return getComplianceStatus() === 'Pass'
  }

  const handleScheduleReview = () => {
    // For demo purposes, simulate scheduling a review
    if (scheduledReview) {
      // Edit existing booking
      alert('Navigating to scheduler page to edit booking...')
    } else {
      // Book new review - simulate setting a scheduled date
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7) // 7 days from now
      futureDate.setHours(14, 30, 0, 0) // 2:30 PM
      setScheduledReview(futureDate)
      showToast('Review successfully scheduled')
    }
  }

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
    const initialFileType = preselectedDocumentType || ''
    const filesWithIds: UploadedFile[] = selectedFiles.map((file, index) => ({
      ...file,
      id: `file-${Date.now()}-${index}`,
      name: file.name || `File ${uploadedFiles.length + index + 1}`,
      fileTypes: [initialFileType],
      dateOfIssue: '',
      confirmed: false
    }))
    
    // Append new files to existing ones
    setUploadedFiles(prev => [...prev, ...filesWithIds])
    
    // If this is the first upload, set current index to 0, otherwise keep current position
    if (uploadedFiles.length === 0) {
      setCurrentFileIndex(0)
    }
    
    // Always open association modal after upload to allow users to associate files
    setIsAssociationModalOpen(true)
    
    setIsUploadModalOpen(false)
    setSelectedFiles([])
    setHasUnsavedChanges(false)
    setShowValidationErrors(false)
    setFileToDelete(null)
  }

  const handleAddFromRow = (documentName: string) => {
    setPreselectedDocumentType(documentName)
    
    // Check if this document type already has uploads
    const existingDoc = medicalDocuments.find(doc => doc.name === documentName)
    if (existingDoc && existingDoc.hasUpload && existingDoc.uploadedFiles) {
      // Load existing files for editing
      const existingFiles: UploadedFile[] = existingDoc.uploadedFiles.map((fileName, index) => {
        const mockFile = new File([''], fileName, { type: 'application/pdf' })
        return Object.assign(mockFile, {
          id: `existing-${Date.now()}-${index}`,
          fileTypes: [documentName],
          dateOfIssue: '', // Would load from saved data in real app
          confirmed: true, // Assume previously confirmed
        })
      })
      
      setUploadedFiles(existingFiles)
      setCurrentFileIndex(0)
      setIsAssociationModalOpen(true)
    } else {
      // New upload flow
      setIsUploadModalOpen(true)
    }
  }

  const handleFileTypeChange = (value: string, index: number = 0) => {
    setHasUnsavedChanges(true)
    setShowValidationErrors(false)
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
    setHasUnsavedChanges(true)
    setShowValidationErrors(false)
    setUploadedFiles(prev => prev.map((file, index) => 
      index === currentFileIndex ? { ...file, dateOfIssue: value } : file
    ))
  }

  const handleConfirmationChange = (checked: boolean) => {
    setHasUnsavedChanges(true)
    setShowValidationErrors(false)
    setUploadedFiles(prev => prev.map((file, index) => 
      index === currentFileIndex ? { ...file, confirmed: checked } : file
    ))
  }

  const handleSave = () => {
    // Check if all files are valid before saving
    if (!areAllFilesValid()) {
      setShowValidationErrors(true)
      return
    }

    // Update medical documents status based on uploaded files
    const newMedicalDocuments = [...medicalDocuments]
    const currentTime = new Date().toISOString()
    
    // If updating existing documents, replace the files completely
    if (preselectedDocumentType) {
      const docIndex = newMedicalDocuments.findIndex(doc => doc.name === preselectedDocumentType)
      if (docIndex !== -1) {
        const allFilesForThisType = uploadedFiles
          .filter(file => file.fileTypes.includes(preselectedDocumentType))
          .map(file => file.name)
        
        newMedicalDocuments[docIndex] = {
          ...newMedicalDocuments[docIndex],
          status: "Uploaded",
          hasUpload: allFilesForThisType.length > 0,
          uploadedFiles: allFilesForThisType,
          uploadCount: allFilesForThisType.length,
          lastUpdated: allFilesForThisType.length > 0 ? currentTime : undefined
        }
      }
    } else {
      // Regular upload flow - add new files
      uploadedFiles.forEach(file => {
        file.fileTypes.forEach(fileType => {
          if (fileType) {
            const docIndex = newMedicalDocuments.findIndex(doc => doc.name === fileType)
            if (docIndex !== -1) {
              const existingFiles = newMedicalDocuments[docIndex].uploadedFiles || []
              const newFiles = existingFiles.includes(file.name) ? existingFiles : [...existingFiles, file.name]
              
              newMedicalDocuments[docIndex] = {
                ...newMedicalDocuments[docIndex],
                status: "Uploaded",
                hasUpload: true,
                uploadedFiles: newFiles,
                uploadCount: newFiles.length,
                lastUpdated: currentTime
              }
            }
          }
        })
      })
    }
    
    setMedicalDocuments(newMedicalDocuments)
    
    // Show toast notification
    const fileCount = uploadedFiles.length
    const isUpdate = preselectedDocumentType !== null
    const toastMessage = isUpdate 
      ? `${fileCount} file${fileCount !== 1 ? 's' : ''} have been successfully updated`
      : `${fileCount} file${fileCount !== 1 ? 's' : ''} have been successfully added`
    showToast(toastMessage)
    
    // Close modal and reset state
    setIsAssociationModalOpen(false)
    setUploadedFiles([])
    setCurrentFileIndex(0)
    setHasUnsavedChanges(false)
    setShowCloseWarning(false)
    setShowValidationErrors(false)
    setPreselectedDocumentType(null)
    setFileToDelete(null)
  }

  const handleNext = () => {
    // Validate current file before proceeding
    if (!isCurrentFileValid()) {
      setShowValidationErrors(true)
      return
    }

    if (currentFileIndex < uploadedFiles.length - 1) {
      setCurrentFileIndex(prev => prev + 1)
      setShowValidationErrors(false)
      setFileToDelete(null)
    }
  }

  const handleBack = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(prev => prev - 1)
      setShowValidationErrors(false)
      setFileToDelete(null)
    }
  }

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowCloseWarning(true)
    } else {
      setIsAssociationModalOpen(false)
      setUploadedFiles([])
      setCurrentFileIndex(0)
      setPreselectedDocumentType(null)
      setFileToDelete(null)
    }
  }

  const handleForceClose = () => {
    setIsAssociationModalOpen(false)
    setUploadedFiles([])
    setCurrentFileIndex(0)
    setHasUnsavedChanges(false)
    setShowCloseWarning(false)
    setPreselectedDocumentType(null)
    setFileToDelete(null)
  }

  const confirmFileDelete = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId)
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    
    // Update medical documents if this file was associated
    if (fileToRemove && fileToRemove.fileTypes[0]) {
      const docName = fileToRemove.fileTypes[0]
      setMedicalDocuments(prevDocs => prevDocs.map(doc => {
        if (doc.name === docName && doc.uploadedFiles) {
          const updatedFiles = doc.uploadedFiles.filter(fileName => fileName !== fileToRemove.name)
          return {
            ...doc,
            uploadedFiles: updatedFiles,
            uploadCount: updatedFiles.length,
            hasUpload: updatedFiles.length > 0,
            lastUpdated: updatedFiles.length > 0 ? doc.lastUpdated : undefined
          }
        }
        return doc
      }))
    }
    
    if (currentFileIndex >= uploadedFiles.length - 1) {
      setCurrentFileIndex(Math.max(0, uploadedFiles.length - 2))
    }
    
    setFileToDelete(null)
  }

  const currentFile = uploadedFiles[currentFileIndex]

  // Validation logic
  const isCurrentFileValid = () => {
    if (!currentFile) return false
    const hasValidFileType = currentFile.fileTypes.some(type => type !== '')
    const hasDateOfIssue = currentFile.dateOfIssue && currentFile.dateOfIssue !== ''
    const isConfirmed = currentFile.confirmed
    return hasValidFileType && hasDateOfIssue && isConfirmed
  }

  const areAllFilesValid = () => {
    return uploadedFiles.every((file) => {
      const hasValidFileType = file.fileTypes.some(type => type !== '')
      const hasDateOfIssue = file.dateOfIssue && file.dateOfIssue !== ''
      const isConfirmed = file.confirmed
      return hasValidFileType && hasDateOfIssue && isConfirmed
    })
  }

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

          {/* Compliance Overview Section */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Compliance Status Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full mr-4 ${
                  getComplianceStatus() === 'Pass' ? 'bg-green-100' :
                  getComplianceStatus() === 'Fail' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  <Shield className={`w-6 h-6 ${
                    getComplianceStatus() === 'Pass' ? 'text-green-600' :
                    getComplianceStatus() === 'Fail' ? 'text-red-600' :
                    'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Compliance Status</h3>
                  <p className="text-sm text-gray-500">Overall requirement status</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-semibold ${
                  getComplianceStatus() === 'Pass' ? 'bg-green-100 text-green-800' :
                  getComplianceStatus() === 'Fail' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getComplianceStatus()}
                </span>
                {getComplianceStatus() === 'Pass' && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>

            {/* Compliance Summary Document Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <Download className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Documentation</h3>
                  <p className="text-sm text-gray-500">Download compliance report</p>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Get Summary Document
              </button>
            </div>

            {/* Schedule Review Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full mr-4 ${
                  scheduledReview ? 'bg-green-100' : areRequirementsMet() ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Calendar className={`w-6 h-6 ${
                    scheduledReview ? 'text-green-600' : areRequirementsMet() ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Review Appointment</h3>
                  <p className="text-sm text-gray-500">
                    {scheduledReview ? 'Appointment scheduled' : 'Schedule your review'}
                  </p>
                </div>
              </div>
              
              {scheduledReview ? (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center text-green-800">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        {scheduledReview.toLocaleDateString()} at {scheduledReview.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={handleScheduleReview}
                    className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Edit Booking
                  </button>
                </div>
              ) : (
                <div className="relative group">
                  <button 
                    onClick={handleScheduleReview}
                    disabled={!areRequirementsMet()}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      areRequirementsMet() 
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Book Review
                  </button>
                  
                  {/* Enhanced tooltip for disabled state */}
                  {!areRequirementsMet() && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-56 bg-gray-900 text-white text-sm rounded-lg px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl">
                      <div className="text-center">
                        <div className="font-medium mb-1">Requirements not met</div>
                        <div className="text-xs text-gray-300">Complete all document uploads to enable booking</div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CRC/VSC Section */}
          <div className="mb-8">
            <div className="bg-slate-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
              <h2 className="text-lg font-medium">CRC/VSC</h2>
              <button 
                onClick={() => {
                  setPreselectedDocumentType(null)
                  setIsUploadModalOpen(true)
                }}
                className="text-sm bg-slate-500 hover:bg-slate-400 px-3 py-1 rounded text-white"
              >
                Upload
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-b-lg">
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
                <div>NAME</div>
                <div>STATUS</div>
                <div>VALID UNTIL</div>
                <div>ACTIONS</div>
                <div>UPLOADS</div>
                <div>Updated</div>
              </div>
              
              <div className="grid grid-cols-6 gap-4 p-4 items-center border-b">
                <div className="text-sm">Criminal Records Check</div>
                <div className="text-sm text-gray-500">No Status</div>
                <div></div>
                <div>
                  <button 
                    onClick={() => handleAddFromRow("Criminal Records Check")}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-1 rounded text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">0</span>
                </div>
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">No updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Documents Section */}
          <div>
            <div className="bg-slate-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
              <h2 className="text-lg font-medium">Permit Form / Medical Documents</h2>
              <button 
                onClick={() => {
                  setPreselectedDocumentType(null)
                  setIsUploadModalOpen(true)
                }}
                className="text-sm bg-slate-500 hover:bg-slate-400 px-3 py-1 rounded text-white"
              >
                Upload
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-b-lg">
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
                <div>NAME</div>
                <div>STATUS</div>
                <div>VALID UNTIL</div>
                <div>ACTIONS</div>
                <div>UPLOADS</div>
                <div>Updated</div>
              </div>
              
              {medicalDocuments.map((doc, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 p-4 items-center border-b last:border-b-0 hover:bg-gray-50">
                  <div className="text-sm">{doc.name}</div>
                  <div className="text-sm text-gray-500">No Status</div>
                  <div></div>
                  <div>
                    <button 
                      onClick={() => handleAddFromRow(doc.name)}
                      className="px-4 py-1 rounded text-sm text-white bg-slate-600 hover:bg-slate-700"
                    >
                      {doc.hasUpload ? 'Update' : 'Add'}
                    </button>
                  </div>
                  <div className="text-sm">
                    {doc.uploadCount && doc.uploadCount > 0 ? (
                      <div className="relative group">
                        <span className="text-blue-600 font-medium cursor-help">
                          {doc.uploadCount}
                        </span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Files: {doc.uploadedFiles?.join(', ')}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {doc.lastUpdated ? (
                      <div>
                        <div>{new Date(doc.lastUpdated).toLocaleDateString()}</div>
                        <div>{new Date(doc.lastUpdated).toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No updates</span>
                    )}
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
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 pointer-events-auto">
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
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div 
            className="bg-white rounded-lg w-full max-w-6xl mx-4 h-[90vh] flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {preselectedDocumentType ? `Update Documents - ${preselectedDocumentType}` : 'Associate Documents'}
                </h3>
              </div>
              <div className="flex items-center space-x-2 relative">
                {preselectedDocumentType && (
                  <button 
                    onClick={() => {
                      // Update the medical document to remove all files
                      setMedicalDocuments(prevDocs => prevDocs.map(doc => {
                        if (doc.name === preselectedDocumentType) {
                          return {
                            ...doc,
                            hasUpload: false,
                            uploadedFiles: [],
                            uploadCount: 0,
                            lastUpdated: undefined
                          }
                        }
                        return doc
                      }))
                      
                      // Close the modal after removing all documents
                      setIsAssociationModalOpen(false)
                      setUploadedFiles([])
                      setCurrentFileIndex(0)
                      setPreselectedDocumentType(null)
                      setHasUnsavedChanges(false)
                      setShowValidationErrors(false)
                      setFileToDelete(null)
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Remove All
                  </button>
                )}
                <button 
                  onClick={() => {
                    setPreselectedDocumentType(preselectedDocumentType)
                    setIsUploadModalOpen(true)
                  }}
                  className="bg-gray-700 text-white px-4 py-2 rounded text-sm"
                >
                  {preselectedDocumentType ? 'Add More Documents' : 'Add Documents'}
                </button>
                <div className="relative">
                  <button 
                    onClick={handleCloseAttempt}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  {/* Close Warning Tooltip */}
                  {showCloseWarning && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
                      <div className="text-sm text-gray-700 mb-3">
                        You have unsaved changes. Your changes will not be saved if you close this window.
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowCloseWarning(false)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleForceClose}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Close Anyway
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
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
                  onClick={() => {
                    setCurrentFileIndex(index)
                    setFileToDelete(null)
                  }}
                  className={`px-4 py-2 text-sm border-r ${
                    index === currentFileIndex
                      ? 'bg-white border-t border-l border-r border-gray-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {truncateFileName(file.name)}
                  <div className="relative ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setFileToDelete(file.id)
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      ×
                    </button>
                    
                    {/* File Delete Warning Tooltip */}
                    {fileToDelete === file.id && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
                        <div className="text-sm text-gray-700 mb-3">
                          This action cannot be undone. The document will be permanently removed from this upload.
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setFileToDelete(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => confirmFileDelete(file.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
              {uploadedFiles.length === 0 ? (
                /* Empty State */
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      {preselectedDocumentType ? `No documents for ${preselectedDocumentType}` : 'No documents uploaded'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Click &quot;Add {preselectedDocumentType ? 'More ' : ''}Documents&quot; to get started
                    </p>
                  </div>
                </div>
              ) : (
                <>
              {/* Left Side - Form */}
              <div className="w-1/2 p-6 border-r">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select requirement <span className="text-red-500">*</span>
                  </label>
                  
                  {/* File Type Associations */}
                  {currentFile?.fileTypes.map((fileType, index) => (
                    <div key={index} className="mb-3 flex items-center space-x-2">
                      <select
                        value={fileType}
                        onChange={(e) => handleFileTypeChange(e.target.value, index)}
                        className={`flex-1 p-2 border rounded-md bg-gray-100 ${
                          showValidationErrors && fileType === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
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
                  
                  {/* Show error if no requirement selected */}
                  {showValidationErrors && currentFile && !currentFile.fileTypes.some(type => type !== '') && (
                    <p className="text-red-500 text-xs mt-1">Please select at least one requirement</p>
                  )}
                  
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
                        Date of Issue <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={currentFile?.dateOfIssue || ''}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className={`w-full p-2 border rounded ${
                          showValidationErrors && currentFile && (!currentFile.dateOfIssue || currentFile.dateOfIssue === '') 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</p>
                      {showValidationErrors && currentFile && (!currentFile.dateOfIssue || currentFile.dateOfIssue === '') && (
                        <p className="text-red-500 text-xs mt-1">Date of issue is required</p>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 mb-2">
                        Note: Please make sure you&apos;ve entered the information correctly in this form
                      </p>
                      <label className={`flex items-center p-2 rounded ${
                        showValidationErrors && currentFile && !currentFile.confirmed ? 'bg-red-50 border border-red-200' : ''
                      }`}>
                        <input
                          type="checkbox"
                          checked={currentFile?.confirmed || false}
                          onChange={(e) => handleConfirmationChange(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          I confirm that all information submitted by me are authentic and correct. <span className="text-red-500">*</span>
                        </span>
                      </label>
                      {showValidationErrors && currentFile && !currentFile.confirmed && (
                        <p className="text-red-500 text-xs mt-1">Please confirm the information is correct</p>
                      )}
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
                </>
              )}
            </div>

            {/* Bottom Navigation */}
            {uploadedFiles.length > 0 && (
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
                {uploadedFiles.length === 1 ? (
                  // Single document: Show Save button
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 font-medium"
                  >
                    Save
                  </button>
                ) : currentFileIndex === uploadedFiles.length - 1 ? (
                  // Last document in multi-document upload: Show Save and Close
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 font-medium"
                  >
                    Save and Close
                  </button>
                ) : (
                  // Not last document in multi-document upload: Show Next only
                  <button
                    onClick={handleNext}
                    className="flex items-center px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 font-medium"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-md shadow-lg flex items-center space-x-3 max-w-sm z-50 transition-all duration-300 ${
          toast.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={dismissToast}
            className="text-gray-400 hover:text-white flex-shrink-0 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
