
import {
  FlaskConical,
  Cpu,
  Construction,
  Sigma,
  Leaf,
  Vegan,
  Landmark,
  BrainCircuit,
  Clapperboard,
  Play,
  HelpCircle,
  Youtube,
  Newspaper,
  Atom,
  BarChart3,
  Cog,
  Globe,
  Sprout,
  Code,
  Gamepad2,
  Music,
  Film,
  Tv,
  BookText,
  Mountain,
  Basketball,
  Dumbbell,
  Lightbulb
} from 'lucide-react';
import type { ReactElement } from 'react';

export const getTopicIcon = (topic: string): ReactElement => {
  const lowerCaseTopic = topic.toLowerCase();

  if (lowerCaseTopic.includes('stem')) {
    return <FlaskConical />;
  }
  if (lowerCaseTopic.includes('ai and machine learning') || lowerCaseTopic.includes('ai')) {
    return <BrainCircuit />;
  }
  if (lowerCaseTopic.includes('wildlife and nature')) {
    return <Mountain />;
  }
  if (lowerCaseTopic.includes('vegan living')) {
    return <Vegan />;
  }
  if (lowerCaseTopic.includes('sports')) {
    return <Dumbbell />;
  }
  if (lowerCaseTopic.includes('politics')) {
    return <Landmark />;
  }
  if (lowerCaseTopic.includes('streaming') || lowerCaseTopic.includes('streaming culture')) {
    return <Play />;
  }
  if (lowerCaseTopic.includes('gaming news')) {
    return <Gamepad2 />;
  }
  if (lowerCaseTopic.includes('ideas')) {
    return <Lightbulb />;
  }
  if (lowerCaseTopic.includes('physics')) {
    return <Atom />;
  }
  if (lowerCaseTopic.includes('chemistry')) {
    return <FlaskConical />;
  }
  if (lowerCaseTopic.includes('data analysis')) {
    return <BarChart3 />;
  }
  if (lowerCaseTopic.includes('system engineering')) {
    return <Cog />;
  }
  if (lowerCaseTopic.includes('geography')) {
    return <Globe />;
  }
  if (lowerCaseTopic.includes('plants')) {
    return <Sprout />;
  }
  if (lowerCaseTopic.includes('coding')) {
    return <Code />;
  }
  if (lowerCaseTopic.includes('gaming')) {
    return <Gamepad2 />;
  }
  if (lowerCaseTopic.includes('music')) {
    return <Music />;
  }
  if (lowerCaseTopic.includes('movies')) {
    return <Film />;
  }
  if (lowerCaseTopic.includes('shows')) {
    return <Tv />;
  }
  if (lowerCaseTopic.includes('science')) {
    return <FlaskConical />;
  }
  if (lowerCaseTopic.includes('technology')) {
    return <Cpu />;
  }
  if (lowerCaseTopic.includes('engineering')) {
    return <Construction />;
  }
  if (lowerCaseTopic.includes('math')) {
    return <Sigma />;
  }
  if (lowerCaseTopic.includes('nature')) {
    return <Leaf />;
  }
  if (lowerCaseTopic.includes('vegan')) {
    return <Vegan />;
  }
  if (lowerCaseTopic.includes('popular culture')) {
    return <Clapperboard />;
  }
  if (lowerCaseTopic.includes('youtube')) {
    return <Youtube />;
  }
  if (lowerCaseTopic.includes('current event')) {
    return <Newspaper />;
  }
  if (lowerCaseTopic) {
    return <BookText />;
  }
  return <HelpCircle />;
};
