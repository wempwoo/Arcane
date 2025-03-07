using ArcaneBackend.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArcaneBackend.Infrastructure.Data.Configurations
{
    public class ExplorationNodeConfiguration : IEntityTypeConfiguration<ExplorationNode>
    {
        public void Configure(EntityTypeBuilder<ExplorationNode> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Level)
                .IsRequired();

            builder.Property(x => x.Lane)
                .IsRequired();

            builder.Property(x => x.Type)
                .IsRequired();

            builder.Property(x => x.ExplorationMapId)
                .IsRequired();

            builder.HasMany(x => x.OutgoingPaths)
                .WithOne(x => x.FromNode)
                .HasForeignKey(x => x.FromNodeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.IncomingPaths)
                .WithOne(x => x.ToNode)
                .HasForeignKey(x => x.ToNodeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }

    public class ExplorationPathwayConfiguration : IEntityTypeConfiguration<ExplorationPathway>
    {
        public void Configure(EntityTypeBuilder<ExplorationPathway> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(x => x.FromNode)
                .WithMany(x => x.OutgoingPaths)
                .HasForeignKey(x => x.FromNodeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ToNode)
                .WithMany(x => x.IncomingPaths)
                .HasForeignKey(x => x.ToNodeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}