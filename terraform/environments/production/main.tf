# The Base Generator (openscad.openforge.tools): the bucket the static build is
# synced to. Its CloudFront distribution and cert live in openforge-infra-frontend,
# which reads site_website_endpoint from this state.
#
# The Production workflow uploads each build to s3://<bucket>/<git sha>/ and then
# promotes it to s3://<bucket>/current/.

resource "aws_s3_bucket" "site" {
  bucket = "openforge-openscad-website"
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  index_document {
    suffix = "index.html"
  }
}

# Public read through the website endpoint, as found. OAC and a private bucket
# are openforge_openscad-pt0.
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "site_public_read" {
  statement {
    sid       = "PublicReadGetObject"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket     = aws_s3_bucket.site.id
  policy     = data.aws_iam_policy_document.site_public_read.json
  depends_on = [aws_s3_bucket_public_access_block.site]
}
