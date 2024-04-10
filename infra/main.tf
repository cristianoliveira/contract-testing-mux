resource "aws_instance" "app" {
  ami           = "ami-0fcf52bcf5db7b003" # Ubuntu 20.04 LTS // us-east-1
  instance_type = "t2.micro"
  key_name      = "app-key"

  subnet_id = module.main_vpc.public_subnets[0]
  vpc_security_group_ids = [module.webapp_sg.security_group_id]
  associate_public_ip_address = true

  user_data = templatefile("./tpls/setup.tpl.sh", {
    description   = "foo bar"
    port          = "8080"
  })

  tags = {
    Name = "app"
  }
}
