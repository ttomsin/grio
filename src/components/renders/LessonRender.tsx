import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

export function LessonRender({ data }: { data: any }) {
  const { lesson_type, title, content } = data;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!content || content.length === 0) return null;

  const currentItem = content[currentIndex];
  const isCorrect = selectedOption === currentItem.answer;

  const handleOptionClick = (option: string) => {
    if (showExplanation) return;
    setSelectedOption(option);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < content.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const isFinished = currentIndex === content.length - 1 && showExplanation;

  return (
    <Card className="my-4 border-amber-500/20 bg-zinc-900/80">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base text-amber-500">{title || "Lesson"}</CardTitle>
          <div className="flex gap-1">
            {content.map((_: any, i: number) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-amber-500' : i < currentIndex ? 'bg-amber-500/50' : 'bg-zinc-800'}`} 
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-xl font-medium text-zinc-50 mb-6">{currentItem.prompt}</h3>
          
          <div className="space-y-3">
            {currentItem.options?.map((option: string, i: number) => {
              let btnClass = "w-full justify-start text-left h-auto py-3 px-4 border-zinc-800 bg-zinc-950 hover:bg-zinc-800 hover:border-amber-500/50 transition-all";
              
              if (showExplanation) {
                if (option === currentItem.answer) {
                  btnClass = "w-full justify-start text-left h-auto py-3 px-4 border-green-500/50 bg-green-500/10 text-green-500";
                } else if (option === selectedOption) {
                  btnClass = "w-full justify-start text-left h-auto py-3 px-4 border-red-500/50 bg-red-500/10 text-red-500";
                } else {
                  btnClass = "w-full justify-start text-left h-auto py-3 px-4 border-zinc-800 bg-zinc-950 opacity-50";
                }
              }

              return (
                <Button 
                  key={i} 
                  variant="outline" 
                  className={btnClass}
                  onClick={() => handleOptionClick(option)}
                  disabled={showExplanation}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option}</span>
                    {showExplanation && option === currentItem.answer && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {showExplanation && option === selectedOption && option !== currentItem.answer && <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {showExplanation && (
          <div className="mt-6 p-4 rounded-lg bg-zinc-950 border border-zinc-800 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm text-zinc-300 mb-4">{currentItem.explanation}</p>
            
            {!isFinished ? (
              <Button onClick={handleNext} className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-500/90">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button disabled className="w-full bg-zinc-800 text-zinc-500">
                Lesson Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
