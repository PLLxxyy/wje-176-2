import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { addDays, startOfMonth } from "date-fns";

const sj = (arr: any[]) => JSON.stringify(arr);

async function main() {
  console.log("开始种子数据...");

  const hashedPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@staybnb.com" },
    update: {},
    create: {
      email: "admin@staybnb.com",
      password: hashedPassword,
      name: "系统管理员",
      role: "ADMIN",
      phone: "13800000000",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    },
  });

  const host1 = await prisma.user.upsert({
    where: { email: "host1@staybnb.com" },
    update: {},
    create: {
      email: "host1@staybnb.com",
      password: hashedPassword,
      name: "张房东",
      role: "HOST",
      phone: "13800000001",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhang",
    },
  });

  const host2 = await prisma.user.upsert({
    where: { email: "host2@staybnb.com" },
    update: {},
    create: {
      email: "host2@staybnb.com",
      password: hashedPassword,
      name: "李房东",
      role: "HOST",
      phone: "13800000002",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=li",
    },
  });

  const guest1 = await prisma.user.upsert({
    where: { email: "guest1@staybnb.com" },
    update: {},
    create: {
      email: "guest1@staybnb.com",
      password: hashedPassword,
      name: "王房客",
      role: "GUEST",
      phone: "13900000001",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wang",
    },
  });

  const guest2 = await prisma.user.upsert({
    where: { email: "guest2@staybnb.com" },
    update: {},
    create: {
      email: "guest2@staybnb.com",
      password: hashedPassword,
      name: "赵房客",
      role: "GUEST",
      phone: "13900000002",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhao",
    },
  });

  console.log("用户创建完成");

  const propertiesData = [
    {
      hostId: host1.id,
      title: "外滩江景豪华两居室公寓",
      description: "位于上海外滩核心地段，俯瞰黄浦江和陆家嘴天际线。现代简约风格装修，配备顶级家电。步行5分钟可达地铁2号线，交通便利。周围餐饮购物丰富，南京路步行街步行可达。",
      address: "上海市黄浦区中山东一路88号",
      city: "上海",
      roomType: "APARTMENT" as const,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      pricePerNight: 888,
      amenities: ["wifi", "kitchen", "ac", "elevator", "tv", "workspace", "fridge", "hot_water"],
      photos: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80",
      ],
      coverPhoto: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      status: "APPROVED" as const,
      rating: 4.8,
      reviewCount: 36,
    },
    {
      hostId: host1.id,
      title: "西湖畔花园别墅民宿",
      description: "坐落在杭州西湖边的独栋小别墅，带私家花园和露台。中式禅意装修，清晨可在花园喝茶观景。离西湖步行10分钟，灵隐寺车程20分钟。",
      address: "杭州市西湖区北山街58号",
      city: "杭州",
      roomType: "VILLA" as const,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      pricePerNight: 1580,
      amenities: ["wifi", "kitchen", "parking", "ac", "heating", "tv", "washer", "pets", "fridge", "hot_water"],
      photos: [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      ],
      coverPhoto: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80",
      status: "APPROVED" as const,
      rating: 4.95,
      reviewCount: 58,
    },
    {
      hostId: host2.id,
      title: "三里屯潮流Loft一居",
      description: "北京三里屯核心区域的工业风Loft，挑高5米，楼下即是繁华商圈。适合年轻情侣或独行旅客。楼下咖啡馆、酒吧、潮牌店云集。",
      address: "北京市朝阳区三里屯路19号",
      city: "北京",
      roomType: "STUDIO" as const,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      pricePerNight: 599,
      amenities: ["wifi", "kitchen", "ac", "elevator", "tv", "workspace", "hot_water", "lock"],
      photos: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80",
      ],
      coverPhoto: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80",
      status: "APPROVED" as const,
      rating: 4.6,
      reviewCount: 24,
    },
    {
      hostId: host2.id,
      title: "三亚海景度假公寓",
      description: "三亚湾一线海景房，超大阳台观海看日落。小区带泳池和健身房，步行5分钟到海边。适合家庭度假。",
      address: "三亚市天涯区三亚湾路88号",
      city: "三亚",
      roomType: "APARTMENT" as const,
      maxGuests: 5,
      bedrooms: 2,
      bathrooms: 2,
      pricePerNight: 688,
      amenities: ["wifi", "kitchen", "pool", "gym", "ac", "parking", "elevator", "tv", "washer", "fridge", "hot_water"],
      photos: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
      ],
      coverPhoto: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      status: "APPROVED" as const,
      rating: 4.75,
      reviewCount: 42,
    },
    {
      hostId: host1.id,
      title: "成都宽窄巷子静谧小院",
      description: "位于成都宽窄巷子旁的传统四合院改造民宿，闹中取静。房间带川西特色，院子有茶室和吊椅。步行5分钟到宽窄巷子景区。",
      address: "成都市青羊区宽巷子36号",
      city: "成都",
      roomType: "ENTIRE_HOME" as const,
      maxGuests: 3,
      bedrooms: 1,
      bathrooms: 1,
      pricePerNight: 458,
      amenities: ["wifi", "kitchen", "ac", "heating", "tv", "hot_water", "lock", "smoke_detector"],
      photos: [
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80",
      ],
      coverPhoto: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80",
      status: "APPROVED" as const,
      rating: 4.9,
      reviewCount: 67,
    },
    {
      hostId: host2.id,
      title: "大理洱海边海景客栈",
      description: "大理洱海东岸的海景客栈，每间房都有独立阳台观海。公共区域有书吧和咖啡厅，夜晚可以看星空。提供免费自行车骑行。",
      address: "大理市双廊镇大建旁村66号",
      city: "大理",
      roomType: "PRIVATE_ROOM" as const,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      pricePerNight: 368,
      amenities: ["wifi", "ac", "parking", "tv", "pets", "hot_water", "lock"],
      photos: [
        "https://images.unsplash.com/photo-1464146072230-91cabc968266?w=1200&q=80",
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80",
        "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&q=80",
      ],
      coverPhoto: "https://images.unsplash.com/photo-1464146072230-91cabc968266?w=1200&q=80",
      status: "APPROVED" as const,
      rating: 4.85,
      reviewCount: 89,
    },
    {
      hostId: host1.id,
      title: "丽江古城纳西族庭院",
      description: "丽江古城内的百年纳西族老庭院改造民宿，保留传统木结构和三坊一照壁。有观景台可看古城全景。老板是当地人，会做地道纳西菜。",
      address: "丽江市古城区七一街八一下段55号",
      city: "丽江",
      roomType: "PRIVATE_ROOM" as const,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      pricePerNight: 288,
      amenities: ["wifi", "heating", "tv", "hot_water", "lock", "smoke_detector"],
      photos: [
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
        "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=1200&q=80",
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80",
      ],
      coverPhoto: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
      status: "PENDING" as const,
      rating: 0,
      reviewCount: 0,
    },
    {
      hostId: host2.id,
      title: "西安回民街旁温馨两居",
      description: "西安钟楼附近回民街旁的温馨两居，下楼就是美食街。步行10分钟可达钟楼、鼓楼。地铁2号线钟楼站步行5分钟。",
      address: "西安市莲湖区北院门128号",
      city: "西安",
      roomType: "APARTMENT" as const,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      pricePerNight: 399,
      amenities: ["wifi", "kitchen", "ac", "heating", "elevator", "tv", "workspace", "fridge", "hot_water"],
      photos: [
        "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&q=80",
      ],
      coverPhoto: "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200&q=80",
      status: "APPROVED" as const,
      rating: 4.55,
      reviewCount: 31,
    },
  ];

  const createdProperties = [];
  for (const pData of propertiesData) {
    const prop = await prisma.property.upsert({
      where: { id: createdProperties.length + 1 },
      update: {
        title: pData.title,
      },
      create: {
        ...pData,
        amenities: sj(pData.amenities as any),
        photos: sj(pData.photos as any),
        pricePerNight: pData.pricePerNight as unknown as any,
      },
    });
    createdProperties.push(prop);

    const startDate = startOfMonth(new Date());
    for (let i = 0; i < 60; i++) {
      const date = addDays(startDate, i);
      const isAvailable = Math.random() > 0.3;
      await prisma.calendar.upsert({
        where: {
          propertyId_date: {
            propertyId: prop.id,
            date,
          },
        },
        update: {},
        create: {
          propertyId: prop.id,
          date,
          isAvailable,
          price: pData.pricePerNight as unknown as any,
        },
      });
    }
  }

  console.log("房源与日历数据创建完成");

  const booking1 = await prisma.booking.create({
    data: {
      guestId: guest1.id,
      hostId: host1.id,
      propertyId: 1,
      status: "COMPLETED",
      checkIn: addDays(new Date(), -30),
      checkOut: addDays(new Date(), -27),
      nights: 3,
      guests: 2,
      totalPrice: (888 * 3) as unknown as any,
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      guestId: guest2.id,
      hostId: host2.id,
      propertyId: 3,
      status: "CONFIRMED",
      checkIn: addDays(new Date(), 5),
      checkOut: addDays(new Date(), 8),
      nights: 3,
      guests: 2,
      totalPrice: (599 * 3) as unknown as any,
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      guestId: guest1.id,
      hostId: host1.id,
      propertyId: 2,
      status: "PENDING",
      checkIn: addDays(new Date(), 10),
      checkOut: addDays(new Date(), 14),
      nights: 4,
      guests: 4,
      totalPrice: (1580 * 4) as unknown as any,
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      guestId: guest2.id,
      hostId: host2.id,
      propertyId: 4,
      status: "CHECKED_IN",
      checkIn: addDays(new Date(), -2),
      checkOut: addDays(new Date(), 3),
      nights: 5,
      guests: 3,
      totalPrice: (688 * 5) as unknown as any,
    },
  });

  const booking5 = await prisma.booking.create({
    data: {
      guestId: guest1.id,
      hostId: host1.id,
      propertyId: 5,
      status: "COMPLETED",
      checkIn: addDays(new Date(), -60),
      checkOut: addDays(new Date(), -58),
      nights: 2,
      guests: 2,
      totalPrice: (458 * 2) as unknown as any,
    },
  });

  console.log("订单创建完成");

  await prisma.review.createMany({
    data: [
      {
        authorId: guest1.id,
        userId: host1.id,
        propertyId: 1,
        bookingId: booking1.id,
        rating: 5,
        comment: "位置极佳！江景房视野无敌，房东很热情，推荐入住。",
        reviewType: "GUEST_TO_HOST",
        cleanliness: 5,
        experience: 5,
      },
      {
        authorId: host1.id,
        userId: guest1.id,
        propertyId: 1,
        bookingId: booking1.id,
        rating: 5,
        comment: "客人非常有素质，房间保持得很干净，沟通顺畅，欢迎下次再来！",
        reviewType: "HOST_TO_GUEST",
        guestQuality: 5,
      },
      {
        authorId: guest1.id,
        userId: host1.id,
        propertyId: 5,
        bookingId: booking5.id,
        rating: 5,
        comment: "很有成都特色的小院，喝茶聊天很惬意。离宽窄巷子很近，逛吃方便。",
        reviewType: "GUEST_TO_HOST",
        cleanliness: 4,
        experience: 5,
      },
      {
        authorId: host1.id,
        userId: guest1.id,
        propertyId: 5,
        bookingId: booking5.id,
        rating: 4,
        comment: "整体不错，就是退房稍微晚了点，下次注意时间就更好了。",
        reviewType: "HOST_TO_GUEST",
        guestQuality: 4,
      },
    ],
  });

  console.log("评价创建完成");

  await prisma.complaint.createMany({
    data: [
      {
        userId: guest2.id,
        propertyId: 3,
        bookingId: booking2.id,
        subject: "空调制冷效果差",
        content: "入住后发现空调制冷效果不佳，室温降不下来，已告知房东但尚未处理。",
        status: "IN_PROGRESS",
      },
      {
        userId: guest1.id,
        subject: "客服态度问题",
        content: "咨询平台客服时对方态度冷淡，问题没有得到妥善解决。",
        status: "OPEN",
      },
    ],
  });

  console.log("投诉创建完成");
  console.log("种子数据完成！");
  console.log(`管理员: admin@staybnb.com / 123456`);
  console.log(`房东: host1@staybnb.com / host2@staybnb.com / 123456`);
  console.log(`房客: guest1@staybnb.com / guest2@staybnb.com / 123456`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
