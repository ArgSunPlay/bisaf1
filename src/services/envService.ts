/**
 * Service to synchronize environment variables directly to the backend .env file
 */

export async function syncEnvVariablesWithBackend(envVars: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch('/api/save-env', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(envVars)
    });

    if (res.ok) {
      const data = await res.json();
      console.log('✅ Environment variables automatically saved to .env file:', data);
      return true;
    }
  } catch (err) {
    console.warn('⚠️ Could not connect to /api/save-env server plugin:', err);
  }
  return false;
}
