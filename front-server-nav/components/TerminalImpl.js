import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';


export default function TerminalImpl() {

  const terminalEl = useRef()

  useEffect(() => {
    const term = new Terminal();
    const fitAddon = new FitAddon();
    term.options.theme = {
      background: '#000000',
      foreground: '#ffffff',
      cursor: '#ffffff',
      black: '#000000',
      red: '#cd0000',
      green: '#00cd00',
      yellow: '#cdcd00',
      blue: '#0000ee',
      magenta: '#cd00cd',
      cyan: '#00cdcd',
      white: '#e5e5e5',
      brightBlack: '#7f7f7f',
      brightRed: '#ff0000',
      brightGreen: '#00ff00',
      brightYellow: '#ffff00',
      brightBlue: '#5c5cff',
      brightMagenta: '#ff00ff',
      brightCyan: '#00ffff',
      brightWhite: '#ffffff'
    };
    term.loadAddon(fitAddon);
    term.open(terminalEl.current);
    const textarea = term.textarea;
    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        term.write('\r\n');
      } else {
        term.write(event.key);
      }
    });
    term.write('Hello from xterm in Next.js!\r\n');
    fitAddon.fit();
    return () => {
      var child = terminalEl.current.lastElementChild;
      while (child) {
        terminalEl.current.removeChild(child);
        child = terminalEl.current.lastElementChild;
      }
    }
  }, []);

  return (
    <div id="terminal" ref={terminalEl}></div>
  );
}