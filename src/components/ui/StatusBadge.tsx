import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

type StatusType = 'Signed' | 'Not Signed' | 'Cancelled' | 'Completed' | 'In Progress' | 'Not Started' |
  'In Transit' | 'Planned' | 'Delivered' | 'Delivery completed' | string;

const darkStatusStyles: Record<string, string> = {
  signed: 'bg-[#163127] text-[#70D0A8] border border-[#28523F]',
  completed: 'bg-[#163127] text-[#70D0A8] border border-[#28523F]',
  active: 'bg-[#163127] text-[#70D0A8] border border-[#28523F]',
  delivered: 'bg-[#163127] text-[#70D0A8] border border-[#28523F]',
  'delivery completed': 'bg-[#163127] text-[#70D0A8] border border-[#28523F]',

  'not signed': 'bg-[#322917] text-[#E5C47A] border border-[#5B4724]',
  pending: 'bg-[#322917] text-[#E5C47A] border border-[#5B4724]',
  attention: 'bg-[#322917] text-[#E5C47A] border border-[#5B4724]',

  cancelled: 'bg-[#34191B] text-[#F08A8A] border border-[#5A292B]',
  delayed: 'bg-[#34191B] text-[#F08A8A] border border-[#5A292B]',
  'at risk': 'bg-[#34191B] text-[#F08A8A] border border-[#5A292B]',

  'in progress': 'bg-[#251F32] text-[#BBA8E8] border border-[#42375A]',
  design: 'bg-[#251F32] text-[#BBA8E8] border border-[#42375A]',

  'in transit': 'bg-[#172A2A] text-[#83CACA] border border-[#294949]',
  logistics: 'bg-[#172A2A] text-[#83CACA] border border-[#294949]',

  planned: 'bg-[#17272E] text-[#89C9DF] border border-[#294651]',
  'not started': 'bg-[#18181B] text-[#B4B4B8] border border-[#303035]',
};

const lightStatusStyles: Record<string, string> = {
  signed: 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]',
  completed: 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]',
  active: 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]',
  delivered: 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]',
  'delivery completed': 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]',

  'not signed': 'bg-[#FEF7E0] text-[#B06000] border border-[#FDE293]',
  pending: 'bg-[#FEF7E0] text-[#B06000] border border-[#FDE293]',
  attention: 'bg-[#FEF7E0] text-[#B06000] border border-[#FDE293]',

  cancelled: 'bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]',
  delayed: 'bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]',
  'at risk': 'bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]',

  'in progress': 'bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]',
  design: 'bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]',

  'in transit': 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]',
  logistics: 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]',

  planned: 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]',
  'not started': 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]',
};

export function StatusBadge({ status }: { status: StatusType }) {
  const { theme } = useApp();
  if (!status) return null;
  const isDark = theme === 'dark';
  const key = status.toLowerCase();
  const stylesMap = isDark ? darkStatusStyles : lightStatusStyles;
  const style = stylesMap[key] || (isDark ? 'bg-[#17272E] text-[#89C9DF] border border-[#294651]' : 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]');

  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style}`}
    >
      {status}
    </motion.span>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  if (!status) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        isDark ? 'bg-[#18181B] text-[#B4B4B8] border border-[#303035]' : 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]'
      }`}>
        —
      </span>
    );
  }

  const key = status.toLowerCase();
  let style = isDark ? 'bg-[#18181B] text-[#B4B4B8] border border-[#303035]' : 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]';

  if (key.includes('100%')) {
    style = isDark ? 'bg-[#163127] text-[#70D0A8] border border-[#28523F]' : 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]';
  } else if (key.includes('50%') || key.includes('30%') || key.includes('partial')) {
    style = isDark ? 'bg-[#322917] text-[#E5C47A] border border-[#5B4724]' : 'bg-[#FEF7E0] text-[#B06000] border border-[#FDE293]';
  } else if (key.includes('10%') || key.includes('0%') || key.includes('due') || key.includes('unpaid')) {
    style = isDark ? 'bg-[#34191B] text-[#F08A8A] border border-[#5A292B]' : 'bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style}`}>
      {status}
    </span>
  );
}

