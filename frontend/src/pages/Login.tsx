import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginWithGoogle } = useAuth();

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      loginWithGoogle(credentialResponse.credential);
    }
  };

  const handleQuickDemoLogin = () => {
    loginWithGoogle(undefined, {
      email: 'intern.candidate@reachinbox.ai',
      name: 'ReachInbox Intern Candidate',
      avatar: 'https://lh3.googleusercontent.com/a/default-user',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        
        {/* Brand Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
          <Mail className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">ReachInbox</h1>
        <p className="mt-2 text-sm text-slate-400">
          Cold Email Outreach & Campaign Scheduling
        </p>

      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-700/60 sm:px-10">
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in to access your outreach dashboard</p>
          </div>

          <div className="space-y-4">
            
            {/* Google OAuth Login */}
            <div className="flex flex-col items-center justify-center w-full space-y-2">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.log('Google OAuth error (using demo fallback)');
                  handleQuickDemoLogin();
                }}
                useOneTap
                theme="filled_blue"
                shape="pill"
              />
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">Or Continue As Guest</span>
              </div>
            </div>

            {/* Demo Instant Login */}
            <button
              onClick={handleQuickDemoLogin}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all group"
            >
              <span>Demo Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

          </div>

          {/* Features Highlights */}
          <div className="mt-8 pt-6 border-t border-slate-700/60 space-y-2.5 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Automated campaign scheduling & queueing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Smart rate limiting & provider throttling</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Live delivery logs & message previews</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
