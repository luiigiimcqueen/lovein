import React, { useRef, useEffect } from 'react';

export default function RichTextEditor({ value, onChange, placeholder, height = 200 }) {
  const editorRef = useRef(null);

  // Inicializa o editor quando o componente é montado
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.contentEditable = 'true';
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  // Atualiza o editor quando o valor muda externamente
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Manipula comandos de formatação
  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="rich-text-editor">
      <div className="toolbar flex flex-wrap gap-1 mb-2 p-2 bg-gray-100 rounded-t border border-gray-300">
        <button
          type="button"
          onClick={() => handleCommand('bold')}
          className="p-1 hover:bg-gray-200 rounded"
          title="Negrito"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => handleCommand('italic')}
          className="p-1 hover:bg-gray-200 rounded"
          title="Itálico"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => handleCommand('underline')}
          className="p-1 hover:bg-gray-200 rounded"
          title="Sublinhado"
        >
          <u>U</u>
        </button>
        <span className="mx-1 text-gray-300">|</span>
        <button
          type="button"
          onClick={() => handleCommand('insertOrderedList')}
          className="p-1 hover:bg-gray-200 rounded"
          title="Lista numerada"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => handleCommand('insertUnorderedList')}
          className="p-1 hover:bg-gray-200 rounded"
          title="Lista com marcadores"
        >
          •
        </button>
        <span className="mx-1 text-gray-300">|</span>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Digite o URL do link:');
            if (url) handleCommand('createLink', url);
          }}
          className="p-1 hover:bg-gray-200 rounded"
          title="Inserir link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => handleCommand('removeFormat')}
          className="p-1 hover:bg-gray-200 rounded"
          title="Remover formatação"
        >
          Limpar
        </button>
      </div>
      <div
        ref={editorRef}
        className="content p-2 border border-gray-300 rounded-b focus:outline-none focus:border-purple-500 overflow-auto"
        style={{ height, minHeight: '100px' }}
        onInput={() => onChange(editorRef.current.innerHTML)}
        placeholder={placeholder}
        onFocus={(e) => {
          if (e.target.innerHTML === '') {
            e.target.innerHTML = '<p><br></p>';
          }
        }}
      />
    </div>
  );
}