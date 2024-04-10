terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
    }
  }
}

terraform {
  cloud {
    organization = "cristianoliveiradev"

    workspaces {
      name = "contract-testing"
    }
  }
}
