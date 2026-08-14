'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, Trash, Edit, Paw } from 'reicon-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Patient } from '@/lib/use-patients-store';
import {
  usePatients,
  useAddPatient,
  useRemovePatient,
  useUpdatePatient,
} from '@/lib/use-patients-store';

interface PatientProfilesProps {
  species: 'perro' | 'gato';
  onSelectPatient: (patient: Patient) => void;
  currentWeight?: string;
}

export default function PatientProfiles({
  species,
  onSelectPatient,
  currentWeight,
}: PatientProfilesProps) {
  const patients = usePatients();
  const addPatient = useAddPatient();
  const removePatient = useRemovePatient();
  const updatePatient = useUpdatePatient();

  const [showAddForm, setShowAddForm] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const filteredPatients = useMemo(
    () => patients.filter((p) => p.species === species),
    [patients, species]
  );

  const handleAdd = () => {
    const w = parseFloat(weightInput);
    if (!nameInput.trim() || !w || w <= 0) return;
    const success = addPatient({
      name: nameInput.trim(),
      species,
      weight: w,
      weightUnit: 'kg',
      notes: notesInput.trim() || undefined,
    });
    if (success) {
      setNameInput('');
      setWeightInput('');
      setNotesInput('');
      setShowAddForm(false);
    }
  };

  const handleStartEdit = (p: Patient) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditWeight(String(p.weight));
    setEditNotes(p.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    const w = parseFloat(editWeight);
    if (!editName.trim() || !w || w <= 0) return;
    updatePatient(id, {
      name: editName.trim(),
      weight: w,
      notes: editNotes.trim() || undefined,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient);
  };

  return (
    <div className="space-y-3">
      {/* Quick-Select Dropdown */}
      {filteredPatients.length > 0 && (
        <div className="flex items-center gap-2">
          <Paw size={16} weight="Outline" className="text-primary flex-shrink-0" />
          <select
            className="flex-1 h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            value=""
            onChange={(e) => {
              const patient = filteredPatients.find((p) => p.id === e.target.value);
              if (patient) handleSelect(patient);
            }}
          >
            <option value="" disabled>
              Seleccionar paciente guardado...
            </option>
            {filteredPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.weight}{p.weightUnit}
                {p.notes ? ` (${p.notes.slice(0, 30)})` : ''}
              </option>
            ))}
          </select>
          <Badge variant="secondary" className="flex-shrink-0 text-xs tabular-nums">
            {filteredPatients.length}
          </Badge>
        </div>
      )}

      {/* Patient List (compact) */}
      {filteredPatients.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence initial={false}>
            {filteredPatients.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {editingId === p.id ? (
                  <div className="glass-card p-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nombre"
                        className="h-8 text-sm"
                      />
                      <Input
                        type="number"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        placeholder="Peso"
                        className="h-8 text-sm w-20"
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    <Input
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notas (opcional)"
                      className="h-8 text-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleSaveEdit(p.id)}
                      >
                        Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-3 flex items-center gap-3 group hover:bg-primary/5 transition-colors">
                    <button
                      onClick={() => handleSelect(p)}
                      className="flex-1 text-left min-w-0"
                      title={`Usar ${p.name}`}
                    >
                      <div className="flex items-center gap-2">
                        <User size={14} weight="Outline" className="text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{p.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 ml-5">
                        {p.weight}{p.weightUnit}
                        {p.notes ? ` · ${p.notes.slice(0, 40)}` : ''}
                      </div>
                    </button>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleStartEdit(p)}
                      >
                        <Edit size={13} weight="Outline" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removePatient(p.id)}
                      >
                        <Trash size={13} weight="Outline" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {filteredPatients.length === 0 && !showAddForm && (
        <div className="text-center py-4 text-muted-foreground">
          <Paw size={28} weight="Outline" className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay pacientes de {species === 'perro' ? 'Perro' : 'Gato'} guardados</p>
          <p className="text-xs mt-1 opacity-70">Guarde un paciente para reutilizarlo rápidamente</p>
        </div>
      )}

      {/* Quick-Add Form */}
      {showAddForm ? (
        <Card className="glass-card">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Plus size={14} weight="Outline" className="text-primary" />
              <span className="text-sm font-semibold">Nuevo Paciente</span>
            </div>
            <div className="flex gap-2">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Nombre"
                className="h-9 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                <Input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="Peso"
                  className="h-9 text-sm w-24"
                  min="0.1"
                  step="0.1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <span className="text-xs text-muted-foreground font-semibold">kg</span>
              </div>
            </div>
            <Input
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Notas (opcional)"
              className="h-9 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={handleAdd}
                disabled={!nameInput.trim() || !weightInput || parseFloat(weightInput) <= 0}
              >
                Guardar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-9 text-xs gap-1.5"
          onClick={() => {
            setNameInput('');
            setWeightInput(currentWeight || '');
            setNotesInput('');
            setShowAddForm(true);
          }}
        >
          <Plus size={14} weight="Outline" />
          Guardar paciente actual
        </Button>
      )}
    </div>
  );
}
