export interface Module {
  id: string;
  name: string;
  display_name: string;
  color: string;
  icon: string;
  order: number;
  created_at: string;
}

export interface Operation {
  id: string;
  module_id: string;
  name: string;
  display_name: string;
  order: number;
  created_at: string;
}

export interface QualityCheck {
  id: string;
  operation_id: string;
  ski_id: string;
  status: 'ok' | 'nok' | 'pending';
  notes: string;
  checked_by: string;
  checked_at: string | null;
  created_at: string;
}

export interface MeasurementField {
  id: string;
  operation_id: string;
  name: string;
  display_name: string;
  field_type: 'numeric' | 'pass_fail' | 'pass_repair' | 'text' | 'select';
  unit: string | null;
  required: boolean;
  order: number;
  options?: string[];
  depends_on?: string | null;
  depends_on_value?: string | null;
  created_at: string;
}

export interface SkiRecord {
  id: string;
  serial_number: string;
  sku: string | null;
  brand: string | null;
  side: 'left' | 'right';
  operation_id: string;
  status: 'in_progress' | 'completed' | 'skipped';
  created_at: string;
  updated_at: string;
  created_by: string | null;
  operator_initials: string | null;
  comment: string | null;
}

export interface Measurement {
  id: string;
  ski_record_id: string;
  field_id: string;
  value: string | null;
  skipped: boolean;
  created_at: string;
}
