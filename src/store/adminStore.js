import { create } from 'zustand'

// ── Seed data ──────────────────────────────────────────────

const REQUESTS = [
  { id: 'REQ-001', parent: 'Adaeze Okafor',   child: 'Emeka (7)',   email: 'adaeze@email.com',  phone: '+234 801 234 5678', concern: 'Speech delay, social withdrawal',   date: '2025-11-12', status: 'pending',    therapist: null,         location: 'Lagos, NG' },
  { id: 'REQ-002', parent: 'Ngozi Adeyemi',   child: 'Temi (5)',    email: 'ngozi@email.com',   phone: '+44 7700 900123',   concern: 'Sensory sensitivity, meltdowns',    date: '2025-11-13', status: 'assigned',   therapist: 'Chidi Okonkwo',  location: 'London, UK' },
  { id: 'REQ-003', parent: 'Fatima Bello',    child: 'Yusuf (9)',   email: 'fatima@email.com',  phone: '+234 802 345 6789', concern: 'Behavioural difficulties at school', date: '2025-11-14', status: 'in-progress',therapist: 'Dr. Ada Nwosu',  location: 'Abuja, NG' },
  { id: 'REQ-004', parent: 'Kemi Olawale',    child: 'Seun (6)',    email: 'kemi@email.com',    phone: '+1 415 555 0123',   concern: 'Non-verbal, limited eye contact',   date: '2025-11-15', status: 'pending',    therapist: null,         location: 'Houston, US' },
  { id: 'REQ-005', parent: 'Amaka Eze',       child: 'Chidera (8)', email: 'amaka@email.com',   phone: '+234 803 456 7890', concern: 'Repetitive behaviours, anxiety',    date: '2025-11-16', status: 'completed',  therapist: 'Tolu Adeyemi',   location: 'Enugu, NG' },
  { id: 'REQ-006', parent: 'Bisi Adegoke',    child: 'Lola (4)',    email: 'bisi@email.com',    phone: '+234 804 567 8901', concern: 'Late talker, hyperactivity',        date: '2025-11-17', status: 'assigned',   therapist: 'Fatima Ibrahim', location: 'Ibadan, NG' },
  { id: 'REQ-007', parent: 'James Mensah',    child: 'Kwame (10)',  email: 'james@email.com',   phone: '+44 7800 000123',   concern: 'Difficulty with transitions',      date: '2025-11-18', status: 'pending',    therapist: null,         location: 'Manchester, UK' },
]

const THERAPISTS = [
  { id: 'TH-001', name: 'Dr. Ada Nwosu',    role: 'Clinical Director',      cases: 8,  status: 'active',   email: 'ada@ststephensfam.org',    speciality: 'ABA, Assessment',        joined: '2016-01-10', avatar: 'AN' },
  { id: 'TH-002', name: 'Chidi Okonkwo',    role: 'Lead Therapist',         cases: 12, status: 'active',   email: 'chidi@ststephensfam.org',   speciality: 'Speech & Language',      joined: '2017-03-22', avatar: 'CO' },
  { id: 'TH-003', name: 'Fatima Ibrahim',   role: 'Training Coordinator',   cases: 6,  status: 'active',   email: 'fatima@ststephensfam.org',  speciality: 'Occupational Therapy',   joined: '2018-07-01', avatar: 'FI' },
  { id: 'TH-004', name: 'Tolu Adeyemi',     role: 'Therapy Consultant',     cases: 9,  status: 'active',   email: 'tolu@ststephensfam.org',    speciality: 'Behavioural Therapy',    joined: '2019-09-15', avatar: 'TA' },
  { id: 'TH-005', name: 'Emeka Nwachukwu', role: 'Junior Therapist',       cases: 4,  status: 'training', email: 'emeka@ststephensfam.org',   speciality: 'ABA',                    joined: '2024-01-20', avatar: 'EN' },
  { id: 'TH-006', name: 'Sola Akinwande',  role: 'Junior Therapist',       cases: 3,  status: 'training', email: 'sola@ststephensfam.org',    speciality: 'Family Support',         joined: '2024-03-10', avatar: 'SA' },
]

const REPORTS = [
  { id: 'RPT-001', title: 'Monthly Progress Report - Emeka O.',    therapist: 'Chidi Okonkwo',  patient: 'Emeka (7)',   date: '2025-11-10', type: 'progress', size: '1.2 MB', status: 'reviewed' },
  { id: 'RPT-002', title: 'Initial Assessment - Temi A.',          therapist: 'Chidi Okonkwo',  patient: 'Temi (5)',    date: '2025-11-12', type: 'assessment', size: '842 KB', status: 'pending' },
  { id: 'RPT-003', title: 'Behavioural Evaluation - Yusuf B.',     therapist: 'Dr. Ada Nwosu',  patient: 'Yusuf (9)',   date: '2025-11-13', type: 'assessment', size: '2.1 MB', status: 'reviewed' },
  { id: 'RPT-004', title: 'Session Notes - Chidera E. (Week 8)',   therapist: 'Tolu Adeyemi',   patient: 'Chidera (8)', date: '2025-11-15', type: 'notes', size: '310 KB', status: 'reviewed' },
  { id: 'RPT-005', title: 'Discharge Summary - Chidera E.',        therapist: 'Tolu Adeyemi',   patient: 'Chidera (8)', date: '2025-11-16', type: 'discharge', size: '1.8 MB', status: 'pending' },
  { id: 'RPT-006', title: 'Occupational Therapy Report - Lola A.', therapist: 'Fatima Ibrahim', patient: 'Lola (4)',    date: '2025-11-17', type: 'progress', size: '960 KB', status: 'pending' },
]

const FORMS = [
  { id: 'FRM-001', title: 'Intake Form - Adaeze Okafor',     type: 'intake',    patient: 'Emeka (7)',   sentTo: 'adaeze@email.com', date: '2025-11-12', status: 'submitted' },
  { id: 'FRM-002', title: 'Behavioural Questionnaire - Kemi', type: 'behaviour', patient: 'Seun (6)',    sentTo: 'kemi@email.com',   date: '2025-11-15', status: 'pending' },
  { id: 'FRM-003', title: 'Medical History - Fatima Bello',  type: 'medical',   patient: 'Yusuf (9)',   sentTo: 'fatima@email.com', date: '2025-11-14', status: 'submitted' },
  { id: 'FRM-004', title: 'Intake Form - Bisi Adegoke',      type: 'intake',    patient: 'Lola (4)',    sentTo: 'bisi@email.com',   date: '2025-11-17', status: 'submitted' },
  { id: 'FRM-005', title: 'Intake Form - James Mensah',      type: 'intake',    patient: 'Kwame (10)',  sentTo: 'james@email.com',  date: '2025-11-18', status: 'pending' },
]

// ── Store ──────────────────────────────────────────────────

export const useAdminStore = create((set, get) => ({
  requests:   REQUESTS,
  therapists: THERAPISTS,
  reports:    REPORTS,
  forms:      FORMS,

  // Assign therapist to request
  assignTherapist: (requestId, therapistName) => set(state => ({
    requests: state.requests.map(r =>
      r.id === requestId
        ? { ...r, therapist: therapistName, status: 'assigned' }
        : r
    ),
  })),

  // Update request status
  updateRequestStatus: (requestId, status) => set(state => ({
    requests: state.requests.map(r =>
      r.id === requestId ? { ...r, status } : r
    ),
  })),

  // Mark report reviewed
  markReportReviewed: (reportId) => set(state => ({
    reports: state.reports.map(r =>
      r.id === reportId ? { ...r, status: 'reviewed' } : r
    ),
  })),

  // Mark form sent
  markFormSent: (formId) => set(state => ({
    forms: state.forms.map(f =>
      f.id === formId ? { ...f, status: 'sent' } : f
    ),
  })),

  // Computed helpers
  getStats: () => {
    const { requests, therapists, reports, forms } = get()
    return {
      pendingRequests:  requests.filter(r => r.status === 'pending').length,
      activeTherapists: therapists.filter(t => t.status === 'active').length,
      pendingReports:   reports.filter(r => r.status === 'pending').length,
      pendingForms:     forms.filter(f => f.status === 'pending').length,
      totalRequests:    requests.length,
      totalCases:       requests.filter(r => ['assigned','in-progress'].includes(r.status)).length,
    }
  },
}))
