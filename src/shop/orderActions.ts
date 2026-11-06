export function gmailComposeUrl(recipient: string, subject: string, body: string): string {
  const url = new URL('https://mail.google.com/mail/');
  url.search = new URLSearchParams({ view: 'cm', fs: '1', to: recipient, su: subject, body }).toString();
  return url.toString();
}

// Clipboard access can be denied in an embedded preview. Let the UI offer
// manual selection rather than reporting a copy that did not happen.
export async function tryCopyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
