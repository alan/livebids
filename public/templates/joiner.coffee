li ->
  span -> @data.msg
  img class: 'avatar', src: @data.img_src
  console.log(@data.service)
  if @data.service
    img class: 'service', src: @data.service

