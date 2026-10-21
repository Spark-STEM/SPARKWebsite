export interface StatItem {
  icon: string;
  value: number;
  format?: '$' | 'decimal' | 'number';
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role?: string;
}

export interface ContactFormData {
  email: string;
  subject: string;
  school: string;
  message: string;
}
