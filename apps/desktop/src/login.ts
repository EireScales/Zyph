declare global {
  interface Window {
    loginAPI: {
      getConfig: () => Promise<{ apiBaseUrl: string }>;
      login: (payload: {
        email: string;
        password: string;
        apiBaseUrl: string;
      }) => Promise<{ ok: boolean }>;
    };
  }
}

const form = document.getElementById('form') as HTMLFormElement;
const submitBtn = document.getElementById('submit') as HTMLButtonElement;
const errorEl = document.getElementById('error') as HTMLDivElement;

async function loadConfig() {
  try {
    const config = await window.loginAPI.getConfig();
    const apiUrl = document.getElementById('apiUrl') as HTMLInputElement;
    if (config.apiBaseUrl && apiUrl) apiUrl.value = config.apiBaseUrl;
  } catch {
    // ignore
  }
}

loadConfig();

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.style.display = 'none';
  const apiUrl = (document.getElementById('apiUrl') as HTMLInputElement).value.trim();
  const email = (document.getElementById('email') as HTMLInputElement).value.trim();
  const password = (document.getElementById('password') as HTMLInputElement).value;
  if (!email || !password) return;

  submitBtn.disabled = true;
  try {
    await window.loginAPI.login({
      email,
      password,
      apiBaseUrl: apiUrl || 'http://localhost:3000',
    });
  } catch (err) {
    errorEl.textContent = err instanceof Error ? err.message : 'Login failed';
    errorEl.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
  }
});
