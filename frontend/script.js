document.addEventListener('DOMContentLoaded', () => {
    // Core Elements
    const analyzeBtn = document.getElementById('analyze-btn');
    const userQuery = document.getElementById('user-query');
    const greetingSection = document.getElementById('greeting-section');
    const chatScroller = document.getElementById('chat-scroller');
    const messagesContainer = document.getElementById('messages-container');
    const btnIconContainer = document.getElementById('btn-icon-container');
    const btnLoadingContainer = document.getElementById('btn-loading-container');
    const toastContainer = document.getElementById('toast-container');


    // Toast System
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    };

    // Message Creation Helpers
    const appendUserMessage = (text) => {
        const div = document.createElement('div');
        div.className = 'user-msg';
        div.innerHTML = `<div class="bubble">${text}</div>`;
        messagesContainer.appendChild(div);
        chatScroller.scrollTop = chatScroller.scrollHeight;
    };

    const appendAiMessage = () => {
        const div = document.createElement('div');
        div.className = 'ai-msg';
        div.innerHTML = `
            <div class="ai-header">
                <div class="ai-logo-dot"></div>
                <span class="ai-name">MediAssist AI</span>
            </div>
            <div class="content">
                <div class="bubble prose prose-slate dark:prose-invert prose-sm max-w-none">
                    <!-- Text will be typed here -->
                </div>
                <button class="dev-disclosure-btn hidden" title="View SQL & Details">
                    <span class="material-symbols-outlined text-sm arrow">expand_more</span>
                </button>
                <div class="dev-view space-y-4">
                    <!-- SQL & Table will be rendered here -->
                </div>
            </div>
        `;
        messagesContainer.appendChild(div);
        return div;
    };

    // Professional Typing Effect
    const typeText = (element, text, aiMsgNode, data, speed = 15) => {
        element.innerHTML = '';
        let i = 0;
        const type = () => {
            if (i < text.length) {
                // Append a typing cursor to the current text
                element.innerHTML = marked.parse(text.substring(0, i + 1) + '<span class="inline-block w-1.5 h-4 bg-primary ml-1 animate-pulse"></span>');
                i += Math.ceil(Math.random() * 3) + 1; // Vary typing speed slightly
                chatScroller.scrollTop = chatScroller.scrollHeight;
                setTimeout(type, speed);
            } else {
                element.innerHTML = marked.parse(text); // Final render without cursor
                element.querySelectorAll('pre code').forEach(block => {
                    block.removeAttribute('data-highlighted');
                    hljs.highlightElement(block);
                });
                
                // Finalize Technical Details & Show Disclosure
                renderTechnicalDetails(aiMsgNode, data);
            }
        };
        type();
    };

    const renderTechnicalDetails = (aiMsgNode, data) => {
        const devView = aiMsgNode.querySelector('.dev-view');
        const disclosureBtn = aiMsgNode.querySelector('.dev-disclosure-btn');
        
        if (data.sql_query || (Array.isArray(data.db_result) && data.db_result.length > 0)) {
            const techContainer = document.createElement('div');
            techContainer.className = 'tech-container mt-4 animate-fade-in';
            
            // Build SQL Block
            if (data.sql_query) {
                const sqlHtml = `
                    <div class="bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-800">
                        <div class="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700">
                            <div class="flex gap-2">
                                <div class="size-2.5 rounded-full bg-[#ff5f56] shadow-sm shadow-[#ff5f56]/20"></div>
                                <div class="size-2.5 rounded-full bg-[#ffbd2e] shadow-sm shadow-[#ffbd2e]/20"></div>
                                <div class="size-2.5 rounded-full bg-[#27c93f] shadow-sm shadow-[#27c93f]/20"></div>
                            </div>
                            <button class="copy-sql-btn flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase px-2 py-1 rounded-md hover:bg-slate-700/50 border border-transparent hover:border-slate-600">
                                <span class="material-symbols-outlined text-sm">content_copy</span>
                                <span>Copy SQL</span>
                            </button>
                        </div>
                        <pre class="p-5 overflow-x-auto m-0"><code class="language-sql text-xs text-slate-300"></code></pre>
                    </div>
                `;
                techContainer.insertAdjacentHTML('beforeend', sqlHtml);
                const sqlPre = techContainer.querySelector('code.language-sql');
                sqlPre.textContent = data.sql_query;
                hljs.highlightElement(sqlPre);

                const copyBtn = techContainer.querySelector('.copy-sql-btn');
                copyBtn.onclick = (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(data.sql_query).then(() => {
                        const originalContent = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<span class="material-symbols-outlined text-sm">done</span><span>Copied!</span>';
                        setTimeout(() => { copyBtn.innerHTML = originalContent; }, 2000);
                    });
                };
            }

            // Build Table Block
            if (Array.isArray(data.db_result) && data.db_result.length > 0) {
                const keys = Object.keys(data.db_result[0]);
                const tableHtml = `
                    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div class="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Analysis Results</span>
                            <span class="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">${data.db_result.length} ROWS</span>
                        </div>
                        <div class="table-container max-h-[400px]">
                            <table class="w-full text-left border-collapse text-[11px]">
                                <thead class="bg-slate-50/80 dark:bg-slate-800/80 sticky top-0 backdrop-blur-sm">
                                    <tr>${keys.map(k => `<th class="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">${k}</th>`).join('')}</tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                    ${data.db_result.map(row => `
                                        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            ${keys.map(k => `<td class="px-4 py-2.5 text-slate-600 dark:text-slate-400 border-b border-slate-50 dark:border-slate-800/50 font-medium">${row[k] === null ? '<span class="text-slate-300 italic">null</span>' : row[k]}</td>`).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                techContainer.insertAdjacentHTML('beforeend', tableHtml);
            }

            devView.innerHTML = '';
            devView.appendChild(techContainer);

            // Setup Disclosure Button only when technical content is present
            disclosureBtn.classList.remove('hidden');
            disclosureBtn.onclick = () => {
                const isOpen = devView.classList.contains('active');
                if (isOpen) {
                    devView.style.maxHeight = '0px';
                    devView.classList.remove('active');
                    disclosureBtn.querySelector('.arrow').style.transform = 'rotate(0deg)';
                    disclosureBtn.style.color = '#94a3b8';
                    disclosureBtn.style.background = '#f1f5f9';
                } else {
                    devView.style.maxHeight = '3000px';
                    devView.classList.add('active');
                    disclosureBtn.querySelector('.arrow').style.transform = 'rotate(180deg)';
                    disclosureBtn.style.color = 'var(--primary)';
                    disclosureBtn.style.background = '#e2e8f0';
                    setTimeout(() => { 
                        chatScroller.scrollTo({ 
                            top: chatScroller.scrollHeight, 
                            behavior: 'smooth' 
                        }); 
                    }, 450);
                }
            };
        }
        
        chatScroller.scrollTop = chatScroller.scrollHeight;
    };

    const performAnalysis = async () => {
        const query = userQuery.value.trim();
        if (!query) return;

        greetingSection.classList.add('hidden');
        appendUserMessage(query);
        
        userQuery.value = '';
        adjustHeight(true);
        userQuery.disabled = true;
        
        // Show Loading State
        btnIconContainer.classList.add('hidden');
        btnLoadingContainer.classList.remove('hidden');
        
        analyzeBtn.disabled = true;
        
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: query })
            });

            if (!response.ok) throw new Error('Network Error');
            const data = await response.json();
            
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            const aiMsgNode = appendAiMessage();
            const bubble = aiMsgNode.querySelector('.bubble');
            typeText(bubble, data.result || 'Analysis complete.', aiMsgNode, data);

        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            btnIconContainer.classList.remove('hidden');
            btnLoadingContainer.classList.add('hidden');
            
            userQuery.disabled = false;
            analyzeBtn.disabled = false;
            userQuery.focus();
        }
    };

    analyzeBtn.addEventListener('click', performAnalysis);
    userQuery.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            performAnalysis();
        }
    });

    const minHeight = 48;
    const maxHeight = 200;

    const adjustHeight = (reset = false) => {
        if (reset) {
            userQuery.style.height = `${minHeight}px`;
            return;
        }
        userQuery.style.height = `${minHeight}px`; // Temporarily shrink
        const newHeight = Math.max(minHeight, Math.min(userQuery.scrollHeight, maxHeight));
        userQuery.style.height = `${newHeight}px`;
    };

    userQuery.addEventListener('input', () => adjustHeight());
    window.addEventListener('resize', () => adjustHeight());

    // Set initial height
    adjustHeight(true);

    userQuery.focus();
});
