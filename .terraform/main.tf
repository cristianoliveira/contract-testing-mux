resource "aws_instance" "app" {
  ami           = "ami-0fcf52bcf5db7b003" # Ubuntu 20.04 LTS // us-east-1
  instance_type = "t2.micro"
  key_name      = "app-key"

  subnet_id = module.main_vpc.public_subnets[0]
  vpc_security_group_ids = [module.webapp_sg.security_group_id]
  associate_public_ip_address = true

  iam_instance_profile = aws_iam_instance_profile.ecr_profile.name

  user_data = templatefile("./tpls/setup.tpl.sh", {
    description   = "foo bar"
    aws_ecr_url   = var.aws_ecr_url
    aws_region    = var.aws_region
    app_image_tag = var.app_image_tag
    app_db_url    = var.app_db_url
    port          = "8080"
  })

  tags = {
    Name = "app"
  }
}
