import { useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import { Icon } from './Icon';

export function CopyButton({ text, label, disabled = false }: { text: string; label: string; disabled?: boolean }) {
  const [feedback, setFeedback] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { setFeedback(''); clearTimeout(timer.current); }, [text]);
  async function copy() {
    clearTimeout(timer.current);
    try { await navigator.clipboard.writeText(text); setFeedback('已复制'); }
    catch (error) { setFeedback('复制失败'); console.error(error); }
    timer.current = setTimeout(() => setFeedback(''), 2000);
  }
  return <><Button type="primary" className="copy-resource-button" icon={<Icon name={feedback === '已复制' ? 'check' : 'copy'} />} disabled={disabled} onClick={copy}>{feedback || label}</Button><span className="sr-only" role="status">{feedback}</span></>;
}
