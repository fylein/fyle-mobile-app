export const generateRandomSpenderEmails = (count: number) => {
  const domain = 'fylefore2etests.com';
  const emails: string[] = [];
  for (let i = 1; i <= count; i++) {
    emails.push(`spender${Date.now()}-${i}@${domain}`);
  }
  return emails;
};
