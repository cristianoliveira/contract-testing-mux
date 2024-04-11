{ pkgs ? import <nixpkgs> {} }:
  pkgs.mkShell {
    buildInputs = with pkgs; [
      nodejs

      # You may need to `export NIXPKGS_ALLOW_UNFREE=1`
      terraform
      awscli

      # Load testing
      vegeta
    ];

    shell = pkgs.zsh;
  }
