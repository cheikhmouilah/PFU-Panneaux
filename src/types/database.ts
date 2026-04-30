export type UserRole = 'admin' | 'responsable' | 'technicien' | 'observateur';

export type PanelStatus = 'fonctionnel' | 'en_maintenance' | 'hors_service';

export type PanelCategory = 'A' | 'B' | 'C' | 'D';

export type InterventionType = 'maintenance_preventive' | 'reparation' | 'installation';

export type InterventionStatus = 'planifiee' | 'en_cours' | 'terminee' | 'annulee';

export type InterventionPriority = 'basse' | 'normale' | 'haute' | 'urgente';

export type TechnicianStatus = 'disponible' | 'en_intervention' | 'indisponible';

export type CommandType = 'change_code' | 'reset' | 'test';

export type CommandStatus = 'pending' | 'sent' | 'executed' | 'failed';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Panel {
  id: string;
  code: string;
  category: PanelCategory;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: string;
  status: PanelStatus;
  is_intelligent: boolean;
  installation_date: string;
  last_maintenance: string | null;
  created_at: string;
  updated_at: string;
}

export interface Technician {
  id: string;
  profile_id: string;
  specialization: string;
  phone: string;
  status: TechnicianStatus;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Intervention {
  id: string;
  panel_id: string;
  technician_id: string | null;
  type: InterventionType;
  status: InterventionStatus;
  priority: InterventionPriority;
  description: string;
  scheduled_date: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  panel?: Panel;
  technician?: Technician;
}

export interface PanelCommand {
  id: string;
  panel_id: string;
  command_type: CommandType;
  old_code: string | null;
  new_code: string | null;
  status: CommandStatus;
  sent_by: string | null;
  sent_at: string | null;
  executed_at: string | null;
  notes: string;
  created_at: string;
  panel?: Panel;
}

export interface PanelStatusHistory {
  id: string;
  panel_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  reason: string;
  created_at: string;
}

export interface DashboardStats {
  totalPanels: number;
  functionalPanels: number;
  maintenancePanels: number;
  outOfServicePanels: number;
  intelligentPanels: number;
  totalInterventions: number;
  pendingInterventions: number;
  inProgressInterventions: number;
  completedInterventions: number;
  availableTechnicians: number;
  totalTechnicians: number;
}
