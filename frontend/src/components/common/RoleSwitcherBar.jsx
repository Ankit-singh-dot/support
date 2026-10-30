import React from 'react';
import { useAuth, PRESET_USERS } from '../../context/AuthContext';

// Dev-only helper for switching between seeded users.
export function RoleSwitcherBar() {
  const { user, switchUser } = useAuth();

  return (
    <div className="bg-muted/60 border-b border-border text-xs text-muted-foreground px-4 sm:px-6 h-9 flex items-center justify-end gap-2">
      <label htmlFor="dev-user" className="hidden sm:inline">
        Viewing as
      </label>
      <select
        id="dev-user"
        value={PRESET_USERS.find((p) => p.email === user?.email)?.id || ''}
        onChange={(e) => switchUser(e.target.value)}
        className="bg-background border border-input rounded-md px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {PRESET_USERS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name} · {preset.role.toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

export default RoleSwitcherBar;
