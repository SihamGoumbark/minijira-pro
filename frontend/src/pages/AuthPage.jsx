import { useState } from 'react';
import { FolderKanban, LogIn, UserPlus } from 'lucide-react';
import api from '../services/api';

export default function AuthPage({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('LOGIN');
  const [authForm, setAuthForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = authMode === 'LOGIN' ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, authForm);
      onAuthSuccess(res.data);
    } catch (err) {
      setAuthError(
        err.response?.data?.message ||
          (authMode === 'LOGIN'
            ? 'Email ou mot de passe incorrect.'
            : 'Erreur lors de la création du compte (email déjà utilisé).')
      );
    }
  };

  const inputClass =
    'w-full rounded border border-[#dfe1e6] bg-[#fafbfc] px-3 py-2 text-[13px] text-[#172b4d] focus:border-[#0052cc] focus:bg-white focus:outline-none';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0747a6] to-[#0052cc] p-5">
      <div className="w-full max-w-[380px] rounded-xl bg-white p-7 shadow-2xl">
        <div className="mb-1.5 flex items-center justify-center gap-2.5 text-[20px] font-bold text-[#172b4d]">
          <FolderKanban size={26} className="text-[#0052cc]" />
          <span>Mini-Jira Pro</span>
        </div>
        <p className="mb-5 text-center text-[12.5px] text-[#5e6c84]">
          {authMode === 'LOGIN'
            ? 'Connectez-vous à votre espace Agile'
            : 'Créez un compte collaborateur'}
        </p>

        {authError && (
          <div className="mb-3 rounded bg-[#ffebe6] px-3 py-2 text-[12px] font-medium text-[#bf2600]">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          {authMode === 'REGISTER' && (
            <>
              <input
                className={inputClass}
                type="text"
                placeholder="Nom complet (ex: Sara Bennani)"
                value={authForm.fullName}
                onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                required
              />
              <select
                className={inputClass}
                value={authForm.role}
                onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
              >
                <option value="ADMIN">Rôle : Product Owner / Admin</option>
                <option value="DEVELOPER">Rôle : Développeur / Membre</option>
              </select>
            </>
          )}

          <input
            className={inputClass}
            type="email"
            placeholder="Adresse email"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            required
          />
          <input
            className={inputClass}
            type="password"
            placeholder="Mot de passe"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            required
          />

          <button
            type="submit"
            className="mt-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-[#0052cc] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0747a6]"
          >
            {authMode === 'LOGIN' ? (
              <>
                <LogIn size={16} /> Se connecter
              </>
            ) : (
              <>
                <UserPlus size={16} /> Créer un compte
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-[12.5px] text-[#5e6c84]">
          {authMode === 'LOGIN' ? (
            <>
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setAuthError('');
                }}
                className="cursor-pointer font-semibold text-[#0052cc] hover:underline"
              >
                Créer un compte
              </button>
            </>
          ) : (
            <>
              Déjà inscrit ?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setAuthError('');
                }}
                className="cursor-pointer font-semibold text-[#0052cc] hover:underline"
              >
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}