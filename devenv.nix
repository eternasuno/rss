{pkgs, ...}: {
  languages = {
    javascript = {
      enable = true;
      pnpm = {
        enable = true;
        install.enable = true;
      };
    };
  };

  packages = with pkgs; [
    tailwindcss-language-server
  ];

  scripts = {
    build-container = {
      packages = with pkgs; [nodejs-slim pnpm];
      exec = ''
        pnpm build
        devenv container build rss-factory
      '';
    };
  };

  containers."rss-factory" = {
    copyToRoot = [./dist];
    startupCommand = "${pkgs.nodejs-slim}/bin/node /index.js";
  };
}
