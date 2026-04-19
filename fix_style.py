import codecs
content = codecs.open('components/CarrierNetworkSection.tsx', 'r', 'utf8').read()
content = content.replace("<style>{\\n", "<style>{\\\n")
content = content.replace("\\n                        }</style>", "\\n                        \}</style>")
codecs.open('components/CarrierNetworkSection.tsx', 'w', 'utf8').write(content)
