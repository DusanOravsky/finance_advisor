import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { InsuranceReminderService } from './services/insuranceReminderService';

const PORT = process.env.PORT || 3000;

// Insurance reminder cron job - každý deň o 9:00
const reminderService = new InsuranceReminderService();

const scheduleInsuranceReminders = () => {
  const now = new Date();
  const targetHour = 9;
  const targetMinute = 0;

  // Vypočítaj čas do ďalšieho spustenia
  const nextRun = new Date(now);
  nextRun.setHours(targetHour, targetMinute, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  const msUntilNextRun = nextRun.getTime() - now.getTime();

  console.log(`⏰ Insurance reminders scheduled for ${nextRun.toLocaleString('sk-SK')}`);

  setTimeout(() => {
    reminderService.checkAndSendReminders();
    // Naplánuj ďalšie spustenie o 24 hodín
    setInterval(
      () => {
        reminderService.checkAndSendReminders();
      },
      24 * 60 * 60 * 1000
    );
  }, msUntilNextRun);
};

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);

  // Spusti reminder scheduler
  scheduleInsuranceReminders();

  // Prvý check hneď po štarte (dev mode)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Running initial insurance reminder check...');
    setTimeout(() => {
      reminderService.checkAndSendReminders();
    }, 5000);
  }
});
