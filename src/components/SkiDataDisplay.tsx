interface SkiDataDisplayProps {
  data: Record<string, unknown>;
}

interface FieldDef {
  key: string;
  label: string;
  unit?: string;
}

interface OperationDef {
  label: string;
  fields: FieldDef[];
}

interface ModuleDef {
  label: string;
  color: string;
  headerColor: string;
  operations: OperationDef[];
}

const MODULES: ModuleDef[] = [
  {
    label: 'Core Area',
    color: 'border-stone-500/40 bg-stone-500/5',
    headerColor: 'text-stone-300',
    operations: [
      {
        label: 'Core',
        fields: [
          { key: 'Core thickness', label: 'Core Thickness', unit: 'mm' },
          { key: 'Core centred', label: 'Core Centred' },
          { key: 'Core pocket deepness front', label: 'Pocket Deepness Front', unit: 'mm' },
          { key: 'Core pocket deepness back', label: 'Pocket Deepness Back', unit: 'mm' },
          { key: 'Core damage', label: 'Core Damage' },
          { key: 'core operator', label: 'Operator' },
          { key: 'core area Operator', label: 'Operator' },
          { key: 'core time', label: 'Time' },
          { key: 'core area time', label: 'Time' },
        ],
      },
    ],
  },
  {
    label: 'Press Area',
    color: 'border-blue-500/40 bg-blue-500/5',
    headerColor: 'text-blue-300',
    operations: [
      {
        label: 'Press In',
        fields: [
          { key: 'Press station', label: 'Press Station' },
          { key: 'Pressure in', label: 'Pressure In', unit: 'bar' },
          { key: 'Camber press setup', label: 'Camber Press Setup', unit: 'mm' },
          { key: 'press in operator', label: 'Operator' },
          { key: 'press in time', label: 'Time' },
        ],
      },
      {
        label: 'Press Out',
        fields: [
          { key: 'Pressure out', label: 'Pressure Out', unit: 'bar' },
          { key: 'Press', label: 'Press' },
          { key: 'Temp out press up', label: 'Temp Press Up', unit: '°' },
          { key: 'Temp. out of press up', label: 'Temp Press Up', unit: '°' },
          { key: 'Temp out press down', label: 'Temp Press Down', unit: '°' },
          { key: 'Temp. out of press down', label: 'Temp Press Down', unit: '°' },
          { key: 'press out operator', label: 'Operator' },
          { key: 'press out time', label: 'Time' },
        ],
      },
      {
        label: 'Un-Molding',
        fields: [
          { key: 'un-molding operator', label: 'Operator' },
          { key: 'un-molding time', label: 'Time' },
        ],
      },
      {
        label: 'Surface Check',
        fields: [
          { key: 'Surface state', label: 'Surface State' },
          { key: 'surface check operator', label: 'Operator' },
          { key: 'surface check time', label: 'Time' },
        ],
      },
    ],
  },
  {
    label: 'Finishing Area',
    color: 'border-amber-500/40 bg-amber-500/5',
    headerColor: 'text-amber-300',
    operations: [
      {
        label: 'Cut Out',
        fields: [
          { key: 'Cut out', label: 'Cut Out' },
          { key: 'cut out operator', label: 'Operator' },
          { key: 'cut out time', label: 'Time' },
          { key: 'cut ou time', label: 'Time' },
        ],
      },
      {
        label: 'Sanding',
        fields: [
          { key: 'Temperature', label: 'Temperature', unit: '°' },
          { key: 'Flex test', label: 'Flex Test' },
          { key: 'Spacer out', label: 'Spacer Out' },
          { key: 'Spacer Out', label: 'Spacer Out' },
          { key: 'Flatness base sanding', label: 'Flatness Base' },
          { key: 'Flatness twist', label: 'Flatness Twist' },
          { key: 'Camber height', label: 'Camber Height' },
          { key: 'Camber height before', label: 'Camber Height Before', unit: 'mm' },
          { key: 'Camber height after', label: 'Camber Height After', unit: 'mm' },
          { key: 'Spatule height', label: 'Spatule Height', unit: 'mm' },
          { key: 'Tail height', label: 'Tail Height', unit: 'mm' },
          { key: 'Base gap sanding', label: 'Base Gap' },
          { key: 'Base Gap', label: 'Base Gap' },
          { key: 'sanding operator', label: 'Operator' },
          { key: 'sanding time', label: 'Time' },
        ],
      },
      {
        label: 'Sidewall Milling',
        fields: [
          { key: 'Sidewall', label: 'Sidewall' },
          { key: 'sidewall operator', label: 'Operator' },
          { key: 'sidewall time', label: 'Time' },
        ],
      },
      {
        label: 'Soft Touch',
        fields: [
          { key: 'Tail bumper', label: 'Tail Bumper' },
          { key: 'soft touch operator', label: 'Operator' },
          { key: 'soft touch time', label: 'Time' },
        ],
      },
      {
        label: 'Base Gap Repair',
        fields: [
          { key: 'Base Gap repair', label: 'Base Gap Repair' },
          { key: 'base gap repair operator', label: 'Operator' },
          { key: 'base gap repair time', label: 'Time' },
        ],
      },
    ],
  },
  {
    label: 'Tuning Area',
    color: 'border-cyan-500/40 bg-cyan-500/5',
    headerColor: 'text-cyan-300',
    operations: [
      {
        label: 'Flattening',
        fields: [
          { key: 'Flatness base flattening', label: 'Flatness Base' },
          { key: 'Spatule', label: 'Spatule' },
          { key: 'Tail', label: 'Tail' },
          { key: 'flattening operator', label: 'Operator' },
          { key: 'flattening time', label: 'Time' },
        ],
      },
      {
        label: 'Nose & Tail Structure',
        fields: [
          { key: 'Tail Structure', label: 'Tail Structure' },
          { key: 'Nose structure', label: 'Nose Structure' },
          { key: 'nose & tail operaor', label: 'Operator' },
          { key: 'nose & tail time', label: 'Time' },
        ],
      },
      {
        label: 'Service Machine',
        fields: [
          { key: 'Edges', label: 'Edges' },
          { key: 'Structure', label: 'Structure' },
          { key: 'machine operator', label: 'Operator' },
          { key: 'machine time', label: 'Time' },
        ],
      },
    ],
  },
  {
    label: 'Final QC Area',
    color: 'border-rose-500/40 bg-rose-500/5',
    headerColor: 'text-rose-300',
    operations: [
      {
        label: 'Final QC',
        fields: [
          { key: 'Flatness base final', label: 'Flatness Base' },
          { key: 'Finale Flatness twist', label: 'Flatness Twist' },
          { key: 'Finale Camber height', label: 'Camber Height' },
          { key: 'Finale Camber height mm', label: 'Camber Height', unit: 'mm' },
          { key: 'Base Gap Finition', label: 'Base Gap Finition' },
          { key: 'Base', label: 'Base Rating' },
          { key: 'Topsheet', label: 'Topsheet Rating' },
          { key: 'Weight', label: 'Weight', unit: 'g' },
          { key: 'QC grade', label: 'QC Grade' },
          { key: 'Tag NFC', label: 'Tag NFC' },
          { key: 'final QC operator ', label: 'Operator' },
          { key: 'final QC time', label: 'Time' },
        ],
      },
    ],
  },
];

const ALL_KNOWN_KEYS = new Set(
  MODULES.flatMap((m) => m.operations.flatMap((op) => op.fields.map((f) => f.key)))
);

function isEmpty(val: unknown): boolean {
  return val === null || val === undefined || val === '';
}

function ValueBadge({ value }: { value: unknown }) {
  if (isEmpty(value)) {
    return <span className="text-slate-600 text-sm font-medium">—</span>;
  }
  const str = String(value);
  const isPass = /^pass$/i.test(str);
  const isFail = /^fail$/i.test(str);
  const isRepair = /^repair$/i.test(str);
  const isCorrected = /^corrected$/i.test(str);

  if (isPass) {
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
        {str}
      </span>
    );
  }
  if (isFail) {
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
        {str}
      </span>
    );
  }
  if (isRepair || isCorrected) {
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        {str}
      </span>
    );
  }
  return <span className="text-white text-sm font-medium">{str}</span>;
}

function FieldRow({ field, value }: { field: FieldDef; value: unknown }) {
  return (
    <div className="flex justify-between items-center gap-4 py-2 border-b border-slate-700/20 last:border-0">
      <span className="text-slate-400 text-sm shrink-0">{field.label}</span>
      <div className="flex items-center gap-1">
        <ValueBadge value={value} />
        {!isEmpty(value) && field.unit && (
          <span className="text-slate-500 text-xs">{field.unit}</span>
        )}
      </div>
    </div>
  );
}

function ModuleCard({ module, data }: { module: ModuleDef; data: Record<string, unknown> }) {
  const allFields = module.operations.flatMap((op) => op.fields);
  const hasAnyValue = allFields.some((f) => !isEmpty(data[f.key]));

  return (
    <div className={`border rounded-2xl overflow-hidden ${module.color} ${!hasAnyValue ? 'opacity-40' : ''}`}>
      <div className="px-5 py-3 border-b border-slate-700/30">
        <h3 className={`font-bold text-base uppercase tracking-wider ${module.headerColor}`}>
          {module.label}
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {module.operations.map((op) => {
          const opHasValue = op.fields.some((f) => !isEmpty(data[f.key]));
          return (
            <div key={op.label} className={`${!opHasValue ? 'opacity-40' : ''}`}>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                {op.label}
              </p>
              <div className="bg-[#0f1f35]/50 rounded-xl px-4">
                {op.fields.map((f) => (
                  <FieldRow key={f.key} field={f} value={data[f.key]} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SkiDataDisplay({ data }: SkiDataDisplayProps) {
  const rawData = Array.isArray(data) ? (data[0] as Record<string, unknown>) : data;
  const unknownFields = Object.entries(rawData).filter(([key]) => !ALL_KNOWN_KEYS.has(key));

  return (
    <div className="space-y-4">
      {MODULES.map((module) => (
        <ModuleCard key={module.label} module={module} data={rawData} />
      ))}

      {unknownFields.length > 0 && (
        <div className="border border-slate-600/40 bg-slate-600/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700/30">
            <h3 className="text-slate-400 font-bold text-base uppercase tracking-wider">
              Other Fields
            </h3>
          </div>
          <div className="p-4 bg-[#0f1f35]/50 rounded-xl mx-4 mb-4">
            {unknownFields.map(([key, val]) => (
              <FieldRow key={key} field={{ key, label: key }} value={val} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
