# Consumed by openforge-infra-frontend (the CloudFront origin).
output "site_website_endpoint" {
  value = aws_s3_bucket_website_configuration.site.website_endpoint
}

output "site_bucket" {
  value = aws_s3_bucket.site.id
}
