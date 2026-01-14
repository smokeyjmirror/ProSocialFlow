
export interface FileNode {
  name: string;
  children?: FileNode[];
}

export const fileTree: FileNode[] = [
  { name: '.env' },
  { name: 'README.md' },
  { name: 'apphosting.yaml' },
  { name: 'components.json' },
  {
    name: 'docs',
    children: [
      { name: 'backend.json' },
    ],
  },
  { name: 'firestore.rules' },
  { name: 'next.config.ts' },
  { name: 'package.json' },
  {
    name: 'src',
    children: [
      {
        name: 'ai',
        children: [
          { name: 'dev.ts' },
          {
            name: 'flows',
            children: [
              { name: 'generate-image-of-the-day.ts' },
              { name: 'generate-social-media-post.ts' },
              { name: 'generate-topic-ideas.ts' },
            ],
          },
          { name: 'genkit.ts' },
        ],
      },
      {
        name: 'app',
        children: [
          { name: 'actions.ts' },
          { name: 'globals.css' },
          { name: 'layout.tsx' },
          { name: 'page.tsx' },
        ],
      },
      {
        name: 'components',
        children: [
          { name: 'FirebaseErrorListener.tsx' },
          {
            name: 'app',
            children: [
              { name: 'file-navigator.tsx' },
              { name: 'header.tsx' },
              { name: 'post-card.tsx' },
              { name: 'post-queue.tsx' },
            ],
          },
          {
            name: 'ui',
            children: [
              { name: 'accordion.tsx' },
              { name: 'alert-dialog.tsx' },
              { name: 'alert.tsx' },
              { name: 'avatar.tsx' },
              { name: 'badge.tsx' },
              { name: 'button.tsx' },
              { name: 'calendar.tsx' },
              { name: 'card.tsx' },
              { name: 'carousel.tsx' },
              { name: 'chart.tsx' },
              { name: 'checkbox.tsx' },
              { name: 'collapsible.tsx' },
              { name: 'dialog.tsx' },
              { name: 'dropdown-menu.tsx' },
              { name: 'form.tsx' },
              { name: 'input.tsx' },
              { name: 'label.tsx' },
              { name: 'menubar.tsx' },
              { name: 'popover.tsx' },
              { name: 'progress.tsx' },
              { name: 'radio-group.tsx' },
              { name: 'scroll-area.tsx' },
              { name: 'select.tsx' },
              { name: 'separator.tsx' },
              { name: 'sheet.tsx' },
              { name: 'sidebar.tsx' },
              { name: 'skeleton.tsx' },
              { name: 'slider.tsx' },
              { name: 'switch.tsx' },
              { name: 'table.tsx' },
              { name: 'tabs.tsx' },
              { name: 'textarea.tsx' },
              { name: 'toast.tsx' },
              { name: 'toaster.tsx' },
              { name: 'tooltip.tsx' },
            ],
          },
        ],
      },
      {
        name: 'firebase',
        children: [
          { name: 'client-provider.tsx' },
          { name: 'config.ts' },
          { name: 'error-emitter.ts' },
          { name: 'errors.ts' },
          {
            name: 'firestore',
            children: [
              { name: 'use-collection.tsx' },
              { name: 'use-doc.tsx' },
            ],
          },
          { name: 'index.ts' },
          { name: 'non-blocking-login.tsx' },
          { name: 'non-blocking-updates.tsx' },
          { name: 'provider.tsx' },
          { name: 'server-init.ts' },
        ],
      },
      {
        name: 'hooks',
        children: [{ name: 'use-mobile.tsx' }, { name: 'use-toast.ts' }],
      },
      {
        name: 'lib',
        children: [
          { name: 'file-contents.ts' },
          { name: 'file-tree.ts' },
          { name: 'placeholder-images.json' },
          { name: 'placeholder-images.ts' },
          { name: 'topic-icons.tsx' },
          { name: 'utils.ts' },
        ],
      },
    ],
  },
  { name: 'tailwind.config.ts' },
  { name: 'tsconfig.json' },
];
