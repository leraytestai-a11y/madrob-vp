const READ_WEBHOOK_URL =
  'https://n8n.srv833470.hstgr.cloud/webhook/720b5deb-c1f3-4ad6-9c1c-9388981e4a19';

export interface PrerequisiteResult {
  ok: boolean;
  missingLabel?: string;
  gradeCBlocked?: boolean;
  sku?: string | null;
}

type OperationPrerequisite = {
  required: string[];
  conditionalKey?: string;
  conditionalLabel?: string;
};

const PREREQUISITES: Record<string, OperationPrerequisite> = {
  press_in: {
    required: ['core area time'],
  },
  press_out: {
    required: ['press in time'],
  },
  surface_check: {
    required: ['press out time'],
  },
  cut_out: {
    required: ['un-molding time'],
  },
  sanding: {
    required: ['cut out time'],
  },
  sidewall_milling: {
    required: ['sanding time'],
  },
  soft_touch: {
    required: ['sidewall time'],
  },
  flattening: {
    required: ['soft touch time'],
    conditionalKey: 'base gap repair time',
    conditionalLabel: 'Base Gap Repair',
  },
  nose_tail_structure: {
    required: ['flattening time'],
  },
  service_machine: {
    required: ['nose & tail time'],
  },
  final_qc: {
    required: ['machine time'],
  },
};

const TIMESTAMP_LABELS: Record<string, string> = {
  'core area time': 'Core Thickness',
  'press in time': 'Press In',
  'press out time': 'Press Out',
  'un-molding time': 'Un-Molding',
  'cut out time': 'Cut Out',
  'sanding time': 'Sanding',
  'sidewall time': 'Sidewall Milling',
  'soft touch time': 'Soft Touch',
  'base gap repair time': 'Base Gap Repair',
  'flattening time': 'Flattening',
  'nose & tail time': 'Nose & Tail Structure',
  'machine time': 'Service Machine',
  'final QC time': 'Final QC',
};

function isEmpty(val: unknown): boolean {
  return val === null || val === undefined || val === '';
}

export async function checkOperationPrerequisites(
  operationName: string,
  serialNumber: string,
  side: 'left' | 'right'
): Promise<PrerequisiteResult> {
  const prereq = PREREQUISITES[operationName];
  if (!prereq) {
    return { ok: true };
  }

  const checkSide = operationName === 'press_in' || operationName === 'press_out' ? 'left' : side;

  let data: Record<string, unknown>;
  try {
    const response = await fetch(READ_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serial_number: serialNumber, side: checkSide }),
    });
    if (!response.ok) {
      return { ok: true };
    }
    const raw = await response.json();
    data = Array.isArray(raw) ? (raw[0] as Record<string, unknown>) : raw;
  } catch {
    return { ok: true };
  }

  const sku = typeof data['SKU'] === 'string' ? data['SKU'] : null;

  if (data['QC grade'] === 'C') {
    return { ok: false, gradeCBlocked: true, sku };
  }

  for (const key of prereq.required) {
    if (isEmpty(data[key])) {
      const label = TIMESTAMP_LABELS[key] ?? key;
      return { ok: false, missingLabel: label, sku };
    }
  }

  if (prereq.conditionalKey) {
    const condKeyPresent = prereq.conditionalKey in data;
    if (condKeyPresent && isEmpty(data[prereq.conditionalKey])) {
      return { ok: false, missingLabel: prereq.conditionalLabel ?? prereq.conditionalKey, sku };
    }
  }

  return { ok: true, sku };
}
