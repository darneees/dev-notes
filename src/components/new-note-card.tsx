import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { IconoirProvider, Microphone, PlusCircle } from 'iconoir-react';


interface NewNotecardProps {
    onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNotecard({ onNoteCreated }: NewNotecardProps) {

    const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true)
    const [isRecording, setIsRecording] = useState(false)
    const [content, setContent] = useState('')
    const promise = () => new Promise((resolve) => setTimeout(() => resolve({ name: 'Sonner' }), 2000));

    function handleStartEditor() {
        setShouldShowOnBoarding(false)
    }

    function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setContent(event.target.value)

        if (event.target.value === '') {
            setShouldShowOnBoarding(true)
        }
    }

    function handleSaveNote(event: FormEvent) {
        event.preventDefault()

        if (content === '') {
            return
        }

        onNoteCreated(content)

        setContent('')
        setShouldShowOnBoarding(true)

        toast.promise(promise, {
            loading: 'Salvando...',
            success: () => {
                return `Nota salva com sucesso`;
            },
            error: 'Erro ao salvar nota',
        });
    }

    function handleStartRecording() {
        
        const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
        
        if (!isSpeechRecognitionAPIAvailable) {
            alert('infelizmente seu navegador não suporta a API de gravação!')
            return
        }
        
        setIsRecording(true)
        setShouldShowOnBoarding(false)

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        speechRecognition = new SpeechRecognitionAPI()

        speechRecognition.lang = 'pt-br'
        speechRecognition.continuous = true
        speechRecognition.maxAlternatives = 1
        speechRecognition.interimResults = true

        speechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, '')

            setContent(transcription)
        }

        speechRecognition.onerror = (event) => {
            console.error(event)
        }

        speechRecognition.start()
    }

    function handleStopRecording() {
        setIsRecording(false)

        if (speechRecognition !== null) {
            speechRecognition?.stop()
        }
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger className=' flex flex-col outline-none rounded-md bg-slate-700 text-left p-5 gap-3 hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400        '>
                <span className='flex row-auto gap-2 text-lg font-medium text-slate-200'>
                    Adicionar nota

                    <IconoirProvider>
                        <PlusCircle className='text-lime-400 w-6'/>
                    </IconoirProvider>
                </span>
                <p className='text-sm leading-6 text-slate-400'>
                    Grave uma nota em áudio que será convertida para texto automaticamente.
                </p>
            </Dialog.Trigger>


            <Dialog.Portal>
                <Dialog.Overlay className='inset-0 fixed bg-black/50' />

                <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2  md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none'>

                    <Dialog.Close className='absolute right-0 top-0 bg-gray-600 p-3.5 text-slate-300 hover:text-slate-100'>
                        < X className='size-5' />
                    </Dialog.Close>

                    <form className='felx-1 flex flex-col h-full'>

                        <div className='flex flex-1 flex-col gap-3 p-5'>
                            <span className='text-sm font-medium text-slate-300'>
                                Adicionar nota
                            </span>

                            {shouldShowOnBoarding ? (
                                <p className='text-sm leading-6 text-slate-400'>
                                    Comece <button type='button' onClick={handleStartRecording} className='text-lime-400 font-medium hover:underline'> gravando uma nota </button> em áudio ou se preferir <button type='button' onClick={handleStartEditor} className='text-lime-400 font-medium hover:underline'> utilize apenas texto.</button>
                                </p>
                            ) : (
                                <form>
                                    <textarea
                                        autoFocus
                                        placeholder='Escreva sua nota...'
                                        className='w-full bg-transparent text-sm font-medium tracking-tight placeholder:text-slate-500 outline-none'
                                        onChange={handleContentChange}
                                        value={content}
                                    />
                                </form>
                            )}
                        </div>

                        {isRecording ? (
                            <button
                                type='button'
                                onClick={handleStopRecording}
                                className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100'>

                                <IconoirProvider>
                                    <Microphone className='text-red-600 animate-pulse' />
                                </IconoirProvider>

                                Gravando! (Clique p/ interromper)

                            </button>
                        ) : (
                            <button
                                type='button'
                                onClick={handleSaveNote}
                                className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500'>
                                Salvar nota
                            </button>
                        )}

                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}