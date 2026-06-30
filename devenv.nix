{ pkgs, ... }:

{
  languages = {
    javascript = {
      enable = true;
      pnpm = {
        enable = true;
        install.enable = true;
      };
    };
  };

  programs.nix-ld.enable = true;
  programs.nix-ld.libraries = with pkgs; [
    stdenv.cc.cc.lib
    glibc
    zlib
    openssl
  ];

  containers."prod" = {
    fromImage = null;
    copyToRoot = [ ./dist ];
    startupCommand = "${pkgs.nodejs_24}/bin/node /index.js";
    env = {
      NODE_ENV = "production";
      PORT = "3000";
      API_PORT = "3000";
    };
  };
}
