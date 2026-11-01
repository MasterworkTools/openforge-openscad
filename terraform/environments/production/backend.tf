terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0" # pinned with checksums by .terraform.lock.hcl; CI inits -lockfile=readonly
    }
  }

  # openforge-infra's state bucket; apps write under their own prefix.
  backend "s3" {
    bucket         = "openforge-infra-tfstate-908027381953"
    key            = "openforge-openscad/production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "openforge-infra-tfstate-lock"
    encrypt        = true
  }
}

# No default_tags yet: the bucket was hand-built untagged, and tagging it here
# would turn the import into a change. Add them in a later PR.
provider "aws" {
  region = "us-east-1"
}
