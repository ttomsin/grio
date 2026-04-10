import React, { useState, useEffect } from 'react';
import './plugins/core'; // Initialize plugins first
import { Sidebar } from './components/layout/Sidebar';
import { ChatArea } from './components/layout/ChatArea';
import { LandingPage } from './components/layout/LandingPage';
import { useAgent } from './hooks/useAgent';
import { SKILL_REGISTRY } from './lib/skills';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [activeSkillIds, setActiveSkillIds] = useState<string[]>(['records_explorer']);
  const [apiKeyStatus, setApiKeyStatus] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  
  const [apiKeys, setApiKeys] = useState({
    griot: '',
    anthropic: '',
    openrouter: ''
  });
  
  const [provider, setProvider] = useState('anthropic');
  const [model, setModel] = useState('claude-3-7-sonnet-20250219');

  const activeSkills = SKILL_REGISTRY.filter(s => activeSkillIds.includes(s.id));
  const { messages, sendMessage, isLoading, activeToolCall } = useAgent(activeSkills, provider, model, apiKeys, setActiveSkillIds);

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const key = sessionStorage.getItem('griot_key');
    const anthropic = localStorage.getItem('anthropic_key') || '';
    const openrouter = localStorage.getItem('openrouter_key') || '';
    const savedProvider = localStorage.getItem('llm_provider') || 'anthropic';
    const savedModel = localStorage.getItem('llm_model') || 'claude-3-7-sonnet-20250219';
    
    setApiKeys({
      griot: key || '',
      anthropic,
      openrouter
    });
    setProvider(savedProvider);
    setModel(savedModel);

    if (key) {
      setApiKeyStatus(true);
    } else {
      setShowSettingsDialog(true);
    }
  }, []);

  const handleSaveSettings = () => {
    if (apiKeys.griot.trim()) {
      sessionStorage.setItem('griot_key', apiKeys.griot.trim());
      setApiKeyStatus(true);
    }
    localStorage.setItem('anthropic_key', apiKeys.anthropic.trim());
    localStorage.setItem('openrouter_key', apiKeys.openrouter.trim());
    localStorage.setItem('llm_provider', provider);
    localStorage.setItem('llm_model', model);
    
    setShowSettingsDialog(false);
  };

  const handleNewChat = () => {
    window.location.reload();
  };

  const handleStart = (query: string) => {
    setHasStarted(true);
    sendMessage(query);
  };

  if (!hasStarted) {
    return (
      <>
        <LandingPage onStart={handleStart} />
        {/* Settings Dialog still needs to be rendered even on landing page */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Configure your API keys and LLM provider.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Griot API Key</label>
                <Input
                  type="password"
                  placeholder="griot_..."
                  value={apiKeys.griot}
                  onChange={(e) => setApiKeys({...apiKeys, griot: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">LLM Provider</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    if (e.target.value === 'anthropic') setModel('claude-3-7-sonnet-20250219');
                    if (e.target.value === 'gemini') setModel('gemini-2.5-pro');
                    if (e.target.value === 'openrouter') setModel('anthropic/claude-3.5-sonnet');
                  }}
                >
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Gemini (AI Studio)</option>
                  <option value="openrouter">OpenRouter</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Model ID"
                />
              </div>

              {provider === 'anthropic' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Anthropic API Key</label>
                  <Input
                    type="password"
                    value={apiKeys.anthropic}
                    onChange={(e) => setApiKeys({...apiKeys, anthropic: e.target.value})}
                  />
                </div>
              )}

              {provider === 'openrouter' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">OpenRouter API Key</label>
                  <Input
                    type="password"
                    value={apiKeys.openrouter}
                    onChange={(e) => setApiKeys({...apiKeys, openrouter: e.target.value})}
                  />
                </div>
              )}
              
              {provider === 'gemini' && (
                <p className="text-xs text-muted-foreground">Using GEMINI_API_KEY from environment.</p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSaveSettings} className="bg-amber-500 text-zinc-950 hover:bg-amber-500/90">
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <Sidebar 
        activeSkillIds={activeSkillIds} 
        setActiveSkillIds={setActiveSkillIds} 
        onNewChat={handleNewChat}
        apiKeyStatus={apiKeyStatus}
        onOpenSettings={() => setShowSettingsDialog(true)}
      />
      
      <ChatArea 
        messages={messages} 
        sendMessage={sendMessage} 
        isLoading={isLoading} 
        activeToolCall={activeToolCall}
        activeSkills={activeSkills}
      />

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure your API keys and LLM provider.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Griot API Key</label>
              <Input
                type="password"
                placeholder="griot_..."
                value={apiKeys.griot}
                onChange={(e) => setApiKeys({...apiKeys, griot: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">LLM Provider</label>
              <select 
                className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  if (e.target.value === 'anthropic') setModel('claude-3-7-sonnet-20250219');
                  if (e.target.value === 'gemini') setModel('gemini-2.5-pro');
                  if (e.target.value === 'openrouter') setModel('anthropic/claude-3.5-sonnet');
                }}
              >
                <option value="anthropic">Anthropic</option>
                <option value="gemini">Gemini (AI Studio)</option>
                <option value="openrouter">OpenRouter</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Model ID"
              />
            </div>

            {provider === 'anthropic' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Anthropic API Key</label>
                <Input
                  type="password"
                  value={apiKeys.anthropic}
                  onChange={(e) => setApiKeys({...apiKeys, anthropic: e.target.value})}
                />
              </div>
            )}

            {provider === 'openrouter' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">OpenRouter API Key</label>
                <Input
                  type="password"
                  value={apiKeys.openrouter}
                  onChange={(e) => setApiKeys({...apiKeys, openrouter: e.target.value})}
                />
              </div>
            )}
            
            {provider === 'gemini' && (
              <p className="text-xs text-muted-foreground">Using GEMINI_API_KEY from environment.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSaveSettings} className="bg-amber-500 text-zinc-950 hover:bg-amber-500/90">
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
