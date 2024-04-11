resource "aws_instance" "contractapp" {
  ami           = "ami-0fcf52bcf5db7b003" # Ubuntu 20.04 LTS // us-east-1
  instance_type = "t2.micro"
  key_name      = aws_key_pair.aws_kp.key_name

  subnet_id                   = module.main_vpc.public_subnets[0]
  vpc_security_group_ids      = [module.webapp_sg.security_group_id]
  associate_public_ip_address = true

  user_data = data.template_file.setup.rendered

  depends_on = [aws_key_pair.aws_kp]

  tags = {
    Name    = "contractapp"
    Version = "0.0.1"
  }
}

# define user_data
data "template_file" "setup" {
  template = templatefile("./tpls/setup.tpl.sh", {
    description  = "foo bar"
    port         = "8080"
    GITHUB_TOKEN = var.github_token
    version      = "0.0.2"
  })
}

resource "aws_key_pair" "aws_kp" {
  key_name   = "api_key_pair"
  public_key = data.local_file.aws_pub_key.content
}

# In case you want to ssh to your instance
#
# Add the follow rule to main_sg module
#   ingress_rules = ["ssh-tcp"]
#
# Genetare a key pair `ssh-keygen -t ed25519 -C "mail@example"`
# inside of the `./.ssh/` folder and name it "aws"
data "local_file" "aws_pub_key" {
  filename = ".ssh/aws.pub"
}
