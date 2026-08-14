'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notebook, Pin, Trash } from 'reicon-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  useNotes,
  useAddNote,
  useRemoveNote,
  useTogglePin,
} from '@/lib/use-notes-store';
import type { Note } from '@/lib/use-notes-store';

const MAX_CHARS = 500;

function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'hace un momento';
  if (minutes === 1) return 'hace 1 min';
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours === 1) return 'hace 1 hora';
  if (hours < 24) return `hace ${hours} horas`;
  if (days === 1) return 'hace 1 día';
  return `hace ${days} días`;
}

interface ClinicalNotesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ClinicalNotes({ open, onOpenChange }: ClinicalNotesProps) {
  const [noteText, setNoteText] = useState('');
  const notes = useNotes();
  const addNote = useAddNote();
  const removeNote = useRemoveNote();
  const togglePin = useTogglePin();

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
  }, [notes]);

  const handleAdd = () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    addNote(trimmed);
    setNoteText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96 flex flex-col p-0 gap-0 glassmorphism-elevated">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Notebook size={20} weight="Outline" color="oklch(0.55 0.15 165)" />
            Notas Clínicas
          </SheetTitle>
        </SheetHeader>

        {/* Input area */}
        <div className="px-5 pt-4 pb-3 space-y-2 border-b border-primary/10">
          <Textarea
            value={noteText}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) setNoteText(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Escribir nota clínica..."
            className="min-h-[80px] resize-none text-sm"
            maxLength={MAX_CHARS}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {noteText.length}/{MAX_CHARS}
            </span>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!noteText.trim()}
              className="gap-1.5 text-xs"
            >
              <Notebook size={14} weight="Outline" />
              Agregar nota
            </Button>
          </div>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 custom-scrollbar">
          {sortedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-3">
                <Notebook size={32} weight="Outline" className="text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Sin notas clínicas</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Agregue notas rápidas desde aquí
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {sortedNotes.map((note: Note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`group relative rounded-lg bg-card border border-border/50 p-3 transition-all hover:bg-accent/50 hover:shadow-md hover:-translate-y-0.5 ${
                      note.pinned ? 'border-l-[3px] border-l-primary' : 'border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <p className="text-sm text-foreground leading-relaxed line-clamp-3 pr-16">
                      {note.text}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-muted-foreground">
                        {timeAgo(note.createdAt)}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => togglePin(note.id)}
                          className="p-1.5 rounded-md hover:bg-primary/10 transition-colors"
                          title={note.pinned ? 'Desfijar' : 'Fijar'}
                          aria-label={note.pinned ? 'Desfijar nota' : 'Fijar nota'}
                        >
                          <Pin
                            size={14}
                            weight={note.pinned ? 'Fill' : 'Outline'}
                            color={note.pinned ? 'oklch(0.55 0.15 165)' : 'currentColor'}
                            className={note.pinned ? 'text-primary' : 'text-muted-foreground'}
                          />
                        </button>
                        <button
                          onClick={() => removeNote(note.id)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          title="Eliminar"
                          aria-label="Eliminar nota"
                        >
                          <Trash size={14} weight="Outline" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
