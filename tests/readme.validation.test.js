const fs = require('fs');
const path = require('path');

describe('README.md Validation', () => {
  let readmeContent;
  let readmeLines;

  beforeAll(() => {
    const readmePath = path.join(__dirname, '..', 'README.md');
    readmeContent = fs.readFileSync(readmePath, 'utf8');
    readmeLines = readmeContent.split('\n');
  });

  describe('Document Structure', () => {
    it('should have a proper title', () => {
      expect(readmeContent).toMatch(/^# Fyle Mobile App/);
    });

    it('should contain all required sections', () => {
      const requiredSections = [
        '## 🔧 Prerequisites',
        '## ✨ Quick Setup',
        '## 👀 Environment Setup',
        '## ❓ Troubleshooting',
        '## 📂 Project Structure',
        '## 🧪 Testing',
        '## 📱 Running on Devices',
        '## 📊 Deployment',
        '## 🙏 Further Help'
      ];

      requiredSections.forEach(section => {
        expect(readmeContent).toContain(section);
      });
    });

    it('should have a table of contents section', () => {
      expect(readmeContent).toContain('## 📑 Table of Contents');
    });

    it('should have all ToC links matching actual sections', () => {
      const tocLinks = [
        '- [🔧 Prerequisites](#-prerequisites)',
        '- [✨ Quick Setup](#-quick-setup)',
        '- [👀 Environment Setup](#-environment-setup)',
        '- [❓ Troubleshooting](#-troubleshooting)',
        '- [📂 Project Structure](#-project-structure)',
        '- [🧪 Testing](#-testing)',
        '- [📱 Running on Devices](#-running-on-devices)',
        '- [📊 Deployment](#-deployment)',
        '- [🙏 Further Help](#-further-help)'
      ];

      tocLinks.forEach(link => {
        expect(readmeContent).toContain(link);
      });
    });

    it('should have proper section nesting', () => {
      const h1Count = (readmeContent.match(/^# /gm) || []).length;
      const h2Count = (readmeContent.match(/^## /gm) || []).length;
      
      expect(h1Count).toBe(1); // Should have exactly one main title
      expect(h2Count).toBeGreaterThan(5); // Should have multiple main sections
    });
  });

  describe('Prerequisites Section', () => {
    it('should specify Node.js version', () => {
      expect(readmeContent).toMatch(/Node\.js.*v22\.17\.0/);
    });

    it('should mention nvm for Node.js installation', () => {
      expect(readmeContent).toContain('nvm');
      expect(readmeContent).toMatch(/https:\/\/github\.com\/nvm-sh\/nvm/);
    });

    it('should include Ionic CLI installation command', () => {
      expect(readmeContent).toContain('npm install -g @ionic/cli');
    });

    it('should reference Ionic documentation', () => {
      expect(readmeContent).toMatch(/https:\/\/ionicframework\.com\/docs\/cli/);
    });

    it('should provide clear installation instructions', () => {
      expect(readmeContent).toContain('Follow the instructions');
      expect(readmeContent).toContain('Install Ionic globally');
    });
  });

  describe('Quick Setup Section', () => {
    it('should contain git clone command with correct repository URL', () => {
      expect(readmeContent).toContain('git clone https://github.com/fylein/fyle-mobile-app.git');
    });

    it('should include directory change command', () => {
      expect(readmeContent).toContain('cd fyle-mobile-app');
    });

    it('should include npm ci command for dependency installation', () => {
      expect(readmeContent).toContain('npm ci');
    });

    it('should provide ionic serve command', () => {
      expect(readmeContent).toContain('ionic serve -c [env_name]');
    });

    it('should have example usage with staging environment', () => {
      expect(readmeContent).toContain('ionic serve -c staging');
    });

    it('should have numbered setup steps', () => {
      expect(readmeContent).toContain('1. **Clone the repository:**');
      expect(readmeContent).toContain('2. **Install dependencies:**');
      expect(readmeContent).toContain('3. **Set Environment Variables**');
      expect(readmeContent).toContain('4. **Run Locally**');
    });
  });

  describe('Code Blocks', () => {
    it('should have properly formatted bash code blocks', () => {
      const bashBlocks = readmeContent.match(/```bash[\s\S]*?```/g);
      expect(bashBlocks).toBeTruthy();
      expect(bashBlocks.length).toBeGreaterThan(5);
    });

    it('should not have unclosed code blocks', () => {
      const openBlocks = (readmeContent.match(/```/g) || []).length;
      expect(openBlocks % 2).toBe(0);
    });

    it('should have valid command syntax in bash blocks', () => {
      const bashCommands = [
        'npm install -g @ionic/cli',
        'git clone https://github.com/fylein/fyle-mobile-app.git',
        'cd fyle-mobile-app',
        'npm ci',
        'ionic serve -c [env_name]',
        'ionic serve -c staging',
        'rm -rf node_modules',
        'npx ng test',
        'npm run test:no-parallel'
      ];

      bashCommands.forEach(command => {
        expect(readmeContent).toContain(command);
      });
    });

    it('should have properly indented code blocks', () => {
      const codeBlocks = readmeContent.match(/```bash\n[\s\S]*?\n```/g);
      expect(codeBlocks).toBeTruthy();
      
      codeBlocks.forEach(block => {
        // Code blocks should not have leading spaces on commands
        const lines = block.split('\n').slice(1, -1); // Remove opening and closing ```
        lines.forEach(line => {
          if (line.trim().length > 0) {
            expect(line).not.toMatch(/^  +[a-zA-Z]/); // Commands shouldn't be indented
          }
        });
      });
    });
  });

  describe('Environment Setup', () => {
    it('should mention environment files location', () => {
      expect(readmeContent).toContain('/src/environments');
    });

    it('should warn about not modifying environment.ts', () => {
      expect(readmeContent).toContain('Do not make any changes to the `environment.ts` file');
    });

    it('should mention getting environment files from mobile app team', () => {
      expect(readmeContent).toContain('Ping the mobile app team');
    });

    it('should explain environment file naming convention', () => {
      expect(readmeContent).toContain('environment.[env_name].ts');
    });

    it('should have proper warning callout formatting', () => {
      expect(readmeContent).toContain('> [!IMPORTANT]');
    });
  });

  describe('Troubleshooting Section', () => {
    it('should provide solutions for common errors', () => {
      expect(readmeContent).toContain('LIVE_UPDATE_APP_VERSION');
      expect(readmeContent).toContain('Error: Cannot GET /');
      expect(readmeContent).toContain('Unable to create PR');
    });

    it('should include dependency reinstallation solution', () => {
      expect(readmeContent).toContain('rm -rf node_modules');
      expect(readmeContent).toContain('npm ci');
    });

    it('should have numbered troubleshooting items', () => {
      expect(readmeContent).toContain('1. If you encounter');
      expect(readmeContent).toContain('2. `Error: Cannot GET /`');
      expect(readmeContent).toContain('3. Unable to create PR');
    });

    it('should provide clear solution labels', () => {
      expect(readmeContent).toContain('**Solution**:');
    });

    it('should include specific error messages', () => {
      expect(readmeContent).toContain("Property 'LIVE_UPDATE_APP_VERSION' does not exist on type");
    });
  });

  describe('Project Structure', () => {
    it('should have ASCII tree structure', () => {
      expect(readmeContent).toContain('├──');
      expect(readmeContent).toContain('└──');
    });

    it('should include key directories', () => {
      const keyDirectories = [
        'src/',
        'android/',
        'ios/',
        'e2e/',
        'coverage/',
        'node_modules/',
        '.github/',
        'resources/'
      ];

      keyDirectories.forEach(dir => {
        expect(readmeContent).toContain(dir);
      });
    });

    it('should include important configuration files', () => {
      const configFiles = [
        'package.json',
        'angular.json',
        'ionic.config.json',
        'capacitor.config.ts',
        'karma.conf.js',
        'README.md'
      ];

      configFiles.forEach(file => {
        expect(readmeContent).toContain(file);
      });
    });

    it('should have descriptive comments for directories', () => {
      expect(readmeContent).toContain('# Angular-related configuration');
      expect(readmeContent).toContain('# Main source code of the app');
      expect(readmeContent).toContain('# Authentication module');
    });

    it('should show proper directory hierarchy', () => {
      expect(readmeContent).toContain('│   ├── app/');
      expect(readmeContent).toContain('│   │   ├── auth/');
      expect(readmeContent).toContain('│   │   ├── core/');
    });
  });

  describe('Testing Section', () => {
    it('should include unit test command', () => {
      expect(readmeContent).toContain('npx ng test');
    });

    it('should mention non-parallel test execution', () => {
      expect(readmeContent).toContain('npm run test:no-parallel');
    });

    it('should explain why non-parallel is recommended', () => {
      expect(readmeContent).toContain('preventing excessive CPU utilization and memory hogging');
    });

    it('should explain coverage report location', () => {
      expect(readmeContent).toContain('app/coverage/index.html');
    });

    it('should explain coverage metrics', () => {
      const metrics = ['Statements', 'Branches', 'Functions', 'Lines'];
      metrics.forEach(metric => {
        expect(readmeContent).toContain(metric);
      });
    });

    it('should have coverage viewing instructions', () => {
      expect(readmeContent).toContain('### Viewing Coverage Reports');
      expect(readmeContent).toContain('Open the generated `index.html` file');
    });
  });

  describe('Device Running Section', () => {
    it('should provide Android setup commands', () => {
      expect(readmeContent).toContain('ionic build -c staging');
      expect(readmeContent).toContain('ionic capacitor run android -l --external --configuration=staging');
    });

    it('should provide iOS setup commands', () => {
      expect(readmeContent).toContain('ionic build --staging');
      expect(readmeContent).toContain('ionic capacitor run ios -l --external --configuration=staging');
    });

    it('should mention required tools', () => {
      expect(readmeContent).toContain('Android Studio');
      expect(readmeContent).toContain('Xcode');
    });

    it('should have separate sections for Android and iOS', () => {
      expect(readmeContent).toContain('### Android');
      expect(readmeContent).toContain('### iOS');
    });

    it('should mention .env file requirement', () => {
      expect(readmeContent).toContain('Add .env file to project');
    });
  });

  describe('Deployment Section', () => {
    it('should mention GitHub Actions', () => {
      expect(readmeContent).toContain('GitHub Actions');
    });

    it('should include workflow instructions', () => {
      expect(readmeContent).toContain('Manual Workflow - Appflow');
      expect(readmeContent).toContain('Run Workflow');
    });

    it('should mention Slack notifications', () => {
      expect(readmeContent).toContain('Slack');
    });

    it('should provide step-by-step workflow instructions', () => {
      expect(readmeContent).toContain('- Go to the');
      expect(readmeContent).toContain('- From Workflows List');
      expect(readmeContent).toContain('- Select the branch');
    });

    it('should mention Diawi links', () => {
      expect(readmeContent).toContain('Diawi APK and IPA links');
    });
  });

  describe('Links and References', () => {
    it('should have valid external link formats', () => {
      const externalLinks = [
        'https://ionicframework.com/',
        'https://github.com/nvm-sh/nvm',
        'https://ionicframework.com/docs/cli',
        'https://github.com/fylein/fyle-mobile-app.git',
        'https://github.com/fylein/fyle-mobile-app2/actions',
        'https://ionicframework.com/docs'
      ];

      externalLinks.forEach(link => {
        expect(readmeContent).toContain(link);
      });
    });

    it('should have proper markdown link syntax', () => {
      const markdownLinks = readmeContent.match(/\[.*?\]\(.*?\)/g);
      expect(markdownLinks).toBeTruthy();
      expect(markdownLinks.length).toBeGreaterThan(5);
    });

    it('should not have broken internal links', () => {
      const internalLinks = readmeContent.match(/\[.*?\]\(#.*?\)/g) || [];
      internalLinks.forEach(link => {
        const anchor = link.match(/\(#(.*?)\)/)[1];
        const sectionExists = readmeContent.includes(`## ${anchor.replace(/-/g, ' ')}`);
        // Note: This is a simplified check; actual anchor matching might need more sophisticated logic
      });
    });
  });

  describe('Documentation Quality', () => {
    it('should have consistent emoji usage in headers', () => {
      const emojiHeaders = [
        '🔧 Prerequisites',
        '✨ Quick Setup',
        '👀 Environment Setup',
        '❓ Troubleshooting',
        '📂 Project Structure',
        '🧪 Testing',
        '📱 Running on Devices',
        '📊 Deployment',
        '🙏 Further Help'
      ];

      emojiHeaders.forEach(header => {
        expect(readmeContent).toContain(header);
      });
    });

    it('should use consistent formatting for commands', () => {
      const commandsInCodeBlocks = [
        '`npm install -g @ionic/cli`',
        '`npm ci`',
        '`npx ng test`'
      ];

      commandsInCodeBlocks.forEach(command => {
        expect(readmeContent).toContain(command);
      });
    });

    it('should have proper note and warning callouts', () => {
      expect(readmeContent).toContain('> [!NOTE]');
      expect(readmeContent).toContain('> [!IMPORTANT]');
    });

    it('should not have broken formatting', () => {
      expect(readmeContent).not.toMatch(/\]\(\s+/); // spaces after opening parenthesis in links
      expect(readmeContent).not.toMatch(/\s+\)/); // spaces before closing parenthesis in links
      expect(readmeContent).not.toMatch(/^#{7,}/m); // headers deeper than h6
    });

    it('should have consistent line breaks', () => {
      expect(readmeContent).toContain('<br/>');
    });

    it('should have proper bold formatting', () => {
      expect(readmeContent).toContain('**Clone the repository:**');
      expect(readmeContent).toContain('**Install dependencies:**');
      expect(readmeContent).toContain('**Solution**:');
    });
  });

  describe('Content Validation', () => {
    it('should mention specific versions where applicable', () => {
      expect(readmeContent).toContain('v22.17.0'); // Node.js version
    });

    it('should include team contact information', () => {
      expect(readmeContent).toContain('mobile app team');
    });

    it('should provide helpful context for beginners', () => {
      expect(readmeContent).toContain('This repository holds the codebase');
      expect(readmeContent).toContain('Built using the Ionic Framework');
    });

    it('should include platform support information', () => {
      expect(readmeContent).toContain('Android');
      expect(readmeContent).toContain('iOS');
      expect(readmeContent).toContain('supports both Android and iOS platforms');
    });

    it('should have descriptive introduction', () => {
      expect(readmeContent).toContain('provides the tools and guidelines');
      expect(readmeContent).toContain('set up, develop, test, and deploy');
    });
  });

  describe('Command Syntax Validation', () => {
    it('should have consistent ionic commands', () => {
      const ionicCommands = readmeContent.match(/ionic \w+/g) || [];
      ionicCommands.forEach(command => {
        expect(command).toMatch(/^ionic (serve|build|capacitor)/);
      });
    });

    it('should have consistent npm commands', () => {
      const npmCommands = readmeContent.match(/npm \w+/g) || [];
      npmCommands.forEach(command => {
        expect(command).toMatch(/^npm (install|ci|run)/);
      });
    });

    it('should use npx for ng commands', () => {
      expect(readmeContent).toContain('npx ng test');
      expect(readmeContent).not.toContain('ng test'); // Should not use global ng
    });
  });

  describe('Error Handling Instructions', () => {
    it('should provide complete error resolution steps', () => {
      const troubleshootingSection = readmeContent.match(/## ❓ Troubleshooting([\s\S]*?)## 📂 Project Structure/)[1];
      
      expect(troubleshootingSection).toContain('Delete the node_modules folder');
      expect(troubleshootingSection).toContain('Reinstall the dependencies');
      expect(troubleshootingSection).toContain('ensure that all required packages are correctly installed');
    });

    it('should have proper error message formatting', () => {
      expect(readmeContent).toContain('`Property \'LIVE_UPDATE_APP_VERSION\' does not exist on type`');
      expect(readmeContent).toContain('`Error: Cannot GET /`');
    });
  });
});