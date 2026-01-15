
'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import type { SocialPost } from '@/ai/flows/generate-social-media-post';
import type { GenerateImageOfTheDayOutput } from '@/ai/flows/generate-image-of-the-day';
import Header from '@/components/app/header';
import PostQueue from '@/components/app/post-queue';
import FileNavigator from '@/components/app/file-navigator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Wand2,
  RefreshCw,
  Image as ImageIcon,
  Copy,
  Check,
  Info,
  Code,
  History,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import {
  generatePostsAction,
  generateImageOfTheDayAction,
  getTopicHistoryAction,
  generateIdeasAction,
} from './actions';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getTopicIcon } from '@/lib/topic-icons';

export interface Post extends SocialPost {
  id: string;
}

export type SelectedTopic = {
  category: string;
  topic: string;
};

const CATEGORIES = [
    'STEM',
    'AI and Machine Learning',
    'Wildlife and Nature',
    'Vegan Living',
    'Sports',
    'Politics',
    'Streaming Culture',
    'Gaming News',
];

export default function Home() {
  const [generatedPosts, setGeneratedPosts] = useState<Post[]>([]);
  const [ideas, setIdeas] = useState<Record<string, string>>({});
  const [lockedIdeas, setLockedIdeas] = useState<Record<string, boolean>>({});
  const [generatingIdea, setGeneratingIdea] = useState<string | null>(null);

  const [imageOfTheDay, setImageOfTheDay] =
    useState<GenerateImageOfTheDayOutput | null>(null);
  const [topicHistory, setTopicHistory] = useState<Record<string, string[]> | null>(null);

  const [isGeneratingIdeas, startGeneratingIdeas] = useTransition();
  const [isGeneratingPosts, startGeneratingPosts] = useTransition();
  const [isGeneratingImage, startGeneratingImage] = useTransition();
  const [isFetchingHistory, startFetchingHistory] = useTransition();
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerateIdeas = () => {
    startGeneratingIdeas(async () => {
      const categoriesToGenerate = CATEGORIES.filter(
        (category) => !lockedIdeas[category]
      );

      if (categoriesToGenerate.length === 0) {
        toast({
          title: 'All ideas are locked',
          description: 'Unlock some ideas if you want to generate new ones.',
        });
        return;
      }
      
      setGeneratingIdea('__all__'); // Use a special key for "all"
      const result = await generateIdeasAction(categoriesToGenerate);
      setGeneratingIdea(null);
      
      if (result.success && result.data) {
        setIdeas(prev => ({ ...prev, ...result.data }));
      } else {
        toast({
          variant: 'destructive',
          title: 'Idea Generation Failed',
          description: result.error,
        });
      }
    });
  };

  const handleGenerateSingleIdea = (category: string) => {
    setGeneratingIdea(category);
    startGeneratingIdeas(async () => {
      const result = await generateIdeasAction([category]);
      setGeneratingIdea(null);
      if (result.success && result.data) {
        setIdeas(prev => ({ ...prev, ...result.data }));
      } else {
        toast({
          variant: 'destructive',
          title: 'Idea Generation Failed',
          description: result.error,
        });
      }
    });
  };

  const handleLockIdea = (category: string, isChecked: boolean) => {
    setLockedIdeas(prev => ({ ...prev, [category]: isChecked }));
  };

  const handleGeneratePosts = () => {
    const selectedTopics = Object.entries(lockedIdeas)
        .filter(([, isLocked]) => isLocked)
        .map(([category]) => ({ category, topic: ideas[category] }))
        .filter(t => t.topic);

    if (selectedTopics.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No Topics Selected',
            description: 'Please lock in at least one topic idea before generating posts.',
        });
        return;
    }

    startGeneratingPosts(async () => {
      const result = await generatePostsAction({ selectedTopics });

      if (result.success && result.data) {
        const newPosts = result.data.map((p) => ({
          ...p,
          id: crypto.randomUUID(),
        }));
        setGeneratedPosts((prevPosts) => [...newPosts, ...prevPosts]);
        setTopicHistory(null); // Clear history so user can re-fetch
        setIdeas({}); // Clear ideas after generating
        setLockedIdeas({}); // Clear selections
      } else {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: result.error,
        });
      }
    });
  };

  const handleGenerateImage = () => {
    startGeneratingImage(async () => {
      setImageOfTheDay(null);
      const result = await generateImageOfTheDayAction();

      if (result.success && result.data) {
        setImageOfTheDay(result.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Image Generation Failed',
          description: result.error,
        });
      }
    });
  };

  const handleFetchHistory = () => {
    startFetchingHistory(async () => {
      const result = await getTopicHistoryAction();
      if (result.success && result.data) {
        setTopicHistory(result.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Fetch History',
          description: result.error,
        });
      }
    });
  };

  const handleCopyAltText = useCallback(() => {
    if (!imageOfTheDay?.altText) return;
    navigator.clipboard.writeText(imageOfTheDay.altText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Alt text copied to clipboard.',
      });
    });
  }, [imageOfTheDay, toast]);

  const handleDeletePost = useCallback((id: string) => {
    setGeneratedPosts((prevPosts) => prevPosts.filter((p) => p.id !== id));
  }, []);

  const handleUpdatePost = useCallback(
    (id: string, updatedContent: Partial<Post>) => {
      setGeneratedPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === id ? { ...p, ...updatedContent } : p))
      );
    },
    []
  );

  const canGeneratePosts = useMemo(() => {
    return Object.values(lockedIdeas).some(isLocked => isLocked);
  }, [lockedIdeas]);
  
  const isGeneratingAll = generatingIdea === '__all__';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb />
                Step 1: Generate Topic Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Generate initial topic ideas for all categories, or regenerate specific ones.
                </p>
                <Button
                  onClick={handleGenerateIdeas}
                  disabled={isGeneratingIdeas}
                  className="w-full sm:w-auto"
                >
                  {isGeneratingIdeas ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lightbulb className="mr-2 h-4 w-4" />
                  )}
                  Generate All Ideas
                </Button>
              </div>
            </CardContent>
          </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 />
                  Step 2: Select Topics & Generate Posts
                </CardTitle>
                <CardDescription>
                  Lock in your chosen topics using the checkboxes, then generate posts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                        {CATEGORIES.map(category => (
                            <div key={category} className="space-y-3">
                                <label className="font-medium text-sm flex items-center gap-2">
                                    <span className="flex items-center gap-1.5 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:stroke-current text-primary">
                                        {getTopicIcon(category)}
                                    </span>
                                    {category}
                                </label>
                                {(isGeneratingAll && !lockedIdeas[category]) || generatingIdea === category ? (
                                    <div className="h-24 w-full rounded-md bg-muted animate-pulse" />
                                ) : ideas[category] ? (
                                    <div className="flex items-start space-x-2 p-2 rounded-md border border-input min-h-[100px]">
                                         <Checkbox
                                            id={`lock-${category}`}
                                            checked={lockedIdeas[category] || false}
                                            onCheckedChange={(checked) => handleLockIdea(category, !!checked)}
                                            aria-label={`Lock idea for ${category}`}
                                            className="mt-1"
                                          />
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor={`lock-${category}`} className="text-sm font-normal cursor-pointer leading-tight">
                                            {ideas[category]}
                                            </Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={() => handleGenerateSingleIdea(category)}
                                                disabled={isGeneratingIdeas || lockedIdeas[category]}
                                            >
                                                <RefreshCw className={`mr-1.5 h-3 w-3 ${generatingIdea === category ? 'animate-spin' : ''}`} />
                                                Generate New Idea
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                  <div className="flex items-center justify-center text-sm text-muted-foreground p-2 rounded-md border border-dashed min-h-10">
                                    Click "Generate Ideas"
                                  </div>
                                )}
                            </div>
                        ))}
                    </div>
                      <Button
                        onClick={handleGeneratePosts}
                        disabled={isGeneratingPosts || !canGeneratePosts}
                        className="w-full sm:w-auto"
                    >
                        {isGeneratingPosts ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Generate Posts from Selected Topics
                    </Button>
                </div>
              </CardContent>
            </Card>

          <PostQueue
            posts={generatedPosts}
            onDelete={handleDeletePost}
            onUpdate={handleUpdatePost}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon />
                Image of the Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Generate a unique, artistic image based on today's date.
                </p>
                {imageOfTheDay && (
                  <div className="space-y-4">
                    <div className="relative aspect-square w-full max-w-sm mx-auto rounded-lg overflow-hidden border">
                      <Image
                        src={imageOfTheDay.imageUrl}
                        alt={imageOfTheDay.altText}
                        fill
                        className="object-cover"
                      />
                    </div>
                     <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 shrink-0"/>
                      <span>Right-click (or long-press on mobile) the image to copy it to your clipboard.</span>
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="altText" className="text-sm font-medium">Generated Alt Text</label>
                      <Textarea
                        id="altText"
                        value={imageOfTheDay.altText}
                        onChange={(e) => setImageOfTheDay(prev => prev ? {...prev, altText: e.target.value} : null)}
                        className="h-24 resize-none"
                        aria-label="Generated alt text"
                      />
                    </div>
                  </div>
                )}
                {(isGeneratingImage && !imageOfTheDay) && (
                  <div className="relative aspect-square w-full max-w-sm mx-auto rounded-lg bg-muted animate-pulse flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="w-full sm:w-auto"
                  >
                    {isGeneratingImage ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="mr-2 h-4 w-4" />
                    )}
                    Generate Image
                  </Button>
                  {imageOfTheDay && (
                    <Button
                      variant="outline"
                      onClick={handleCopyAltText}
                      disabled={isCopied}
                    >
                      {isCopied ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      {isCopied ? 'Copied Text' : 'Copy Alt Text'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History />
                Firestore Topic History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View the list of recently used topics that the AI avoids duplicating. This history is stored in Firestore.
              </p>
              <Button
                onClick={handleFetchHistory}
                disabled={isFetchingHistory}
                className="w-full sm:w-auto mb-4"
              >
                {isFetchingHistory ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <History className="mr-2 h-4 w-4" />
                )}
                {topicHistory ? 'Refresh History' : 'Fetch History'}
              </Button>
              {topicHistory && (
                 <ScrollArea className="h-72 w-full rounded-md border p-4 font-code text-sm bg-muted/50">
                   <pre><code>{JSON.stringify(topicHistory, null, 2)}</code></pre>
                 </ScrollArea>
              )}
               {isFetchingHistory && !topicHistory && (
                  <div className="h-72 w-full rounded-md border bg-muted/50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                  </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code />
                File Navigator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Browse the project's file structure.
              </p>
              <FileNavigator />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

