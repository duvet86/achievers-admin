namespace Achievers.Domain;

public abstract class Entity
{
    private int? _requestedHashCode;
    private int _Id;

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public virtual int Id
    {
        get
        {
            return _Id;
        }
        protected set
        {
            _Id = value;
        }
    }

    public bool IsTransient()
    {
        return Id == default;
    }

    public override bool Equals(object? obj)
    {
        if (obj == null || obj is not Entity)
        {
            return false;
        }

        if (ReferenceEquals(this, obj))
        {
            return true;
        }

        if (GetType() != obj.GetType())
        {
            return false;
        }

        Entity item = (Entity)obj;

        if (item.IsTransient() || IsTransient())
        {
            return false;
        }
        else
        {
            return item.Id == Id;
        }
    }

    public override int GetHashCode()
    {
        if (!IsTransient())
        {
            if (!_requestedHashCode.HasValue)
            {
                // XOR for random distribution (http://blogs.msdn.com/b/ericlippert/archive/2011/02/28/guidelines-and-rules-for-gethashcode.aspx)
                _requestedHashCode = this.Id.GetHashCode() ^ 31;
            }

            return _requestedHashCode.Value;
        }
        else
            return base.GetHashCode();

    }
    public static bool operator ==(Entity left, Entity right)
    {
        if (Equals(left, null))
        {
            return Equals(right, null);
        }
        else
        {
            return left.Equals(right);
        }
    }

    public static bool operator !=(Entity left, Entity right)
    {
        return !(left == right);
    }
}