import codecs
content = codecs.open('components/CarrierNetworkSection.tsx', 'r', 'utf8').read()
content = content.replace(" className={\\\\}", " className={\\\}")
content = content.replace("className={\inline-block mb-4 text-[10px] font-black uppercase tracking-widest \\\\} bg-white/5 border border-white/10 px-4 py-2 rounded-full\}", "className={\inline-block mb-4 text-[10px] font-black uppercase tracking-widest \ bg-white/5 border border-white/10 px-4 py-2 rounded-full\}")

codecs.open('components/CarrierNetworkSection.tsx', 'w', 'utf8').write(content)
