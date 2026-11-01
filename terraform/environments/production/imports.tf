# The bucket was built by hand. Safe to delete after the first apply has
# recorded these in state.

import {
  to = aws_s3_bucket.site
  id = "openforge-openscad-website"
}

import {
  to = aws_s3_bucket_website_configuration.site
  id = "openforge-openscad-website"
}

import {
  to = aws_s3_bucket_public_access_block.site
  id = "openforge-openscad-website"
}

import {
  to = aws_s3_bucket_policy.site
  id = "openforge-openscad-website"
}
