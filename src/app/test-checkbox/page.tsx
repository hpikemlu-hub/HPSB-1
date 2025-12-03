'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function TestCheckboxPage() {
  const [checked, setChecked] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);

  const availableParticipants = [
    'Rifqi Maulana',
    'Yustisia Pratiwi',
    'Muhammad Shalahuddin'
  ];

  const handleToggle = (participant: string) => {
    console.log('Toggle clicked:', participant);
    setParticipants(prev => {
      const newParticipants = prev.includes(participant)
        ? prev.filter(p => p !== participant)
        : [...prev, participant];
      console.log('New participants:', newParticipants);
      return newParticipants;
    });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkbox Test Page</h1>
      
      {/* Simple Test */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="font-semibold mb-4">Simple Checkbox Test</h2>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => {
              console.log('Checkbox clicked, new value:', value);
              setChecked(value);
            }}
          />
          <Label 
            className="cursor-pointer"
            onClick={() => {
              console.log('Label clicked');
              setChecked(!checked);
            }}
          >
            Test Checkbox (Status: {checked ? 'CHECKED ✓' : 'UNCHECKED'})
          </Label>
        </div>
      </div>

      {/* Participants Test (Like Calendar Form) */}
      <div className="p-4 border rounded">
        <h2 className="font-semibold mb-4">Participants Test</h2>
        <div className="space-y-3">
          {availableParticipants.map((participant) => (
            <div key={participant} className="flex items-center gap-3 p-2 hover:bg-gray-50">
              <Checkbox
                checked={participants.includes(participant)}
                onCheckedChange={() => {
                  console.log('Participant checkbox clicked:', participant);
                  handleToggle(participant);
                }}
              />
              <Label 
                className="cursor-pointer flex-1"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Participant label clicked:', participant);
                  handleToggle(participant);
                }}
              >
                {participant}
              </Label>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <strong>Selected:</strong> {participants.length > 0 ? participants.join(', ') : 'None'}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded font-mono text-sm">
        <div><strong>Simple Checkbox:</strong> {JSON.stringify(checked)}</div>
        <div><strong>Participants:</strong> {JSON.stringify(participants)}</div>
      </div>
    </div>
  );
}
