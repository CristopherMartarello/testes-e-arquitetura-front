import { prisma } from '@/lib/prisma';
import SidebarContent from './sidebar-content';

const Sidebar = async () => {
  const prompts = await prisma.prompt.findMany();
  return <SidebarContent prompts={prompts} />;
};

export default Sidebar;
